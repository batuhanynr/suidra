import { Transaction } from "@mysten/sui/transactions";
import { ContractService } from "./contractService";
import { suiClient } from "../suiClient";
import { VoteInput, Question } from "../types/form.types";
import { TransactionResult } from "../types/sui.types";
import { CONTRACTS, FUNCTIONS } from "../utils/constants";

export class VotingService {
  
  /**
   * Vote on a question
   * NOTE: Move contract uses question_id but actually searches by index
   * We need to get the question ID from the form first
   */
  static async voteOnQuestion(
    formId: string,
    questionIndex: number,
    optionIndex: number
  ): Promise<TransactionResult> {
    try {
      // First get the form to find the question ID
      const form = await this.getFormData(formId);
      if (!form || !form.questions || questionIndex >= form.questions.length) {
        return {
          success: false,
          error: 'Invalid question index or form not found',
        };
      }

      const questionId = form.questions[questionIndex].id;
      
      const transaction = ContractService.createTransaction();
      
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.VOTE_QUESTION}`,
        arguments: [
          transaction.object(formId),
          transaction.pure.id(questionId), // Use actual question ID
          transaction.pure.u64(optionIndex),
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to vote on question:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote on question',
      };
    }
  }

  /**
   * Check if user has already voted on a specific question
   */
  static async hasUserVoted(
    formId: string, 
    questionIndex: number, 
    userAddress?: string
  ): Promise<boolean> {
    try {
      const form = await this.getFormData(formId);
      if (!form || !form.questions || questionIndex >= form.questions.length) {
        return false;
      }

      const question = form.questions[questionIndex];
      const addressToCheck = userAddress || ContractService.getUserAddress();
      
      return question.addresses?.includes(addressToCheck) || false;
    } catch (error) {
      console.error('Failed to check voting status:', error);
      return false;
    }
  }

  /**
   * Get question voting results
   */
  static async getQuestionResults(
    formId: string, 
    questionIndex: number
  ): Promise<{ options: string[]; votes: number[]; totalVotes: number } | null> {
    try {
      const form = await this.getFormData(formId);
      if (!form || !form.questions || questionIndex >= form.questions.length) {
        return null;
      }

      const question = form.questions[questionIndex];
      const totalVotes = question.votes?.reduce((sum: number, count: number) => sum + count, 0) || 0;
      
      return {
        options: question.options || [],
        votes: question.votes || [],
        totalVotes,
      };
    } catch (error) {
      console.error('Failed to get question results:', error);
      return null;
    }
  }

  /**
   * Get all voting results for a form
   */
  static async getFormResults(formId: string): Promise<{
    formId: string;
    questions: Array<{
      questionIndex: number;
      title: string;
      description: string;
      options: string[];
      votes: number[];
      totalVotes: number;
    }>;
  } | null> {
    try {
      const form = await this.getFormData(formId);
      if (!form) {
        return null;
      }

      const questions = form.questions?.map((question: any, index: number) => {
        const totalVotes = question.votes?.reduce((sum: number, count: number) => sum + count, 0) || 0;
        
        return {
          questionIndex: index,
          title: question.title,
          description: question.description,
          options: question.options || [],
          votes: question.votes || [],
          totalVotes,
        };
      }) || [];

      return {
        formId,
        questions,
      };
    } catch (error) {
      console.error('Failed to get form results:', error);
      return null;
    }
  }

  /**
   * Private helper to get form data
   */
  private static async getFormData(formId: string): Promise<any> {
    const response = await suiClient.getObject({
      id: formId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
      return null;
    }

    return response.data.content.fields;
  }
}