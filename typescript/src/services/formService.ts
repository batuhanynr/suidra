import { Transaction } from "@mysten/sui/transactions";
import { ContractService } from "./contractService";
import { suiClient } from "../suiClient";
import { 
  CreateFormInput, 
  AddQuestionInput, 
  Form
} from "../types/form.types";
import { TransactionResult } from "../types/sui.types";
import { CONTRACTS, FUNCTIONS, STRUCTS } from "../utils/constants";

export class FormService {
  
  /**
   * Create a new form (2-step process: create + transfer)
   */
  static async createForm(input: CreateFormInput): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      // Step 1: Call create_form function (returns Form object)
      const [form] = transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.CREATE_FORM}`,
        arguments: [
          transaction.pure.string(input.title),
          transaction.pure.string(input.description),
          transaction.object(CONTRACTS.REGISTRY_ID),
        ],
      });

      // Step 2: Transfer form to creator
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.TRANSFER_FORM_TO_CREATOR}`,
        arguments: [form],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to create form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create form',
      };
    }
  }

  /**
   * Transfer form to creator (separate function if needed)
   */
  static async transferFormToCreator(formId: string): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.TRANSFER_FORM_TO_CREATOR}`,
        arguments: [
          transaction.object(formId),
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to transfer form to creator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer form to creator',
      };
    }
  }

  /**
   * List a form (make it active)
   */
  static async listForm(formId: string): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.LIST_FORM}`,
        arguments: [
          transaction.object(formId),
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to list form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list form',
      };
    }
  }

  /**
   * Delist a form (make it inactive)
   */
  static async delistForm(formId: string): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.DELIST_FORM}`,
        arguments: [
          transaction.object(formId),
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to delist form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delist form',
      };
    }
  }

  /**
   * Relist a form (make it active again)
   */
  static async relistForm(formId: string): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.RELIST_FORM}`,
        arguments: [
          transaction.object(formId),
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to relist form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to relist form',
      };
    }
  }

  /**
   * Get form by object ID
   */
  static async getForm(formId: string): Promise<Form | null> {
    try {
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

      const fields = response.data.content.fields as any;
      
      return {
        id: response.data.objectId,
        title: fields.title,
        description: fields.description,
        author: fields.author,
        questions: fields.questions || [],
        is_active: fields.is_active || false,
      };
    } catch (error) {
      console.error('Failed to get form:', error);
      return null;
    }
  }

  /**
   * Add a question to an existing form
   */
  static async addQuestion(
    formId: string, 
    questionInput: AddQuestionInput
  ): Promise<TransactionResult> {
    try {
      const transaction = ContractService.createTransaction();
      
      // Convert options array to move vector
      const optionsVector = transaction.makeMoveVec({
        elements: questionInput.options.map(option => 
          transaction.pure.string(option)
        ),
      });

      transaction.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::form::${FUNCTIONS.ADD_QUESTION}`,
        arguments: [
          transaction.object(formId),
          transaction.pure.string(questionInput.title),
          transaction.pure.string(questionInput.description),
          optionsVector,
        ],
      });

      return await ContractService.executeTransaction(transaction);
    } catch (error) {
      console.error('Failed to add question:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add question',
      };
    }
  }
}