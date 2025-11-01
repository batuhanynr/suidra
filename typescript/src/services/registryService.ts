import { suiClient } from "../suiClient";
import { ContractService } from "./contractService";
import { FormService } from "./formService";
import { Form } from "../types/form.types";
import { CONTRACTS, FUNCTIONS } from "../utils/constants";

export class RegistryService {
  
  /**
   * Get all form IDs from the registry
   */
  static async getAllFormIds(): Promise<string[]> {
    try {
      const response = await suiClient.getObject({
        id: CONTRACTS.REGISTRY_ID,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
        return [];
      }

      const fields = response.data.content.fields as any;
      return fields.forms || [];
    } catch (error) {
      console.error('Failed to get form IDs from registry:', error);
      return [];
    }
  }

  /**
   * Get all forms with their data
   */
  static async getAllForms(): Promise<Form[]> {
    try {
      const formIds = await this.getAllFormIds();
      if (formIds.length === 0) {
        return [];
      }

      // Fetch all forms in parallel
      const formPromises = formIds.map(id => FormService.getForm(id));
      const forms = await Promise.all(formPromises);

      // Filter out null results
      return forms.filter((form): form is Form => form !== null);
    } catch (error) {
      console.error('Failed to get all forms:', error);
      return [];
    }
  }

  /**
   * Get active forms only
   */
  static async getActiveForms(): Promise<Form[]> {
    try {
      const allForms = await this.getAllForms();
      return allForms.filter(form => form.is_active);
    } catch (error) {
      console.error('Failed to get active forms:', error);
      return [];
    }
  }

  /**
   * Get inactive forms only
   */
  static async getInactiveForms(): Promise<Form[]> {
    try {
      const allForms = await this.getAllForms();
      return allForms.filter(form => !form.is_active);
    } catch (error) {
      console.error('Failed to get inactive forms:', error);
      return [];
    }
  }

  /**
   * Get forms by author
   */
  static async getFormsByAuthor(authorAddress: string): Promise<Form[]> {
    try {
      const allForms = await this.getAllForms();
      return allForms.filter(form => form.author === authorAddress);
    } catch (error) {
      console.error('Failed to get forms by author:', error);
      return [];
    }
  }

  /**
   * Get current user's forms
   */
  static async getCurrentUserForms(): Promise<Form[]> {
    try {
      const userAddress = ContractService.getUserAddress();
      return await this.getFormsByAuthor(userAddress);
    } catch (error) {
      console.error('Failed to get current user forms:', error);
      return [];
    }
  }

  /**
   * Get registry statistics
   */
  static async getRegistryStats(): Promise<{
    totalForms: number;
    activeForms: number;
    inactiveForms: number;
    totalQuestions: number;
  }> {
    try {
      const allForms = await this.getAllForms();
      const activeForms = allForms.filter(form => form.is_active);
      const inactiveForms = allForms.filter(form => !form.is_active);
      const totalQuestions = allForms.reduce(
        (sum, form) => sum + (form.questions?.length || 0), 
        0
      );

      return {
        totalForms: allForms.length,
        activeForms: activeForms.length,
        inactiveForms: inactiveForms.length,
        totalQuestions,
      };
    } catch (error) {
      console.error('Failed to get registry stats:', error);
      return {
        totalForms: 0,
        activeForms: 0,
        inactiveForms: 0,
        totalQuestions: 0,
      };
    }
  }

  /**
   * Search forms by title or description
   */
  static async searchForms(searchTerm: string): Promise<Form[]> {
    try {
      const allForms = await this.getAllForms();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allForms.filter(form => 
        form.title.toLowerCase().includes(lowercaseSearch) ||
        form.description.toLowerCase().includes(lowercaseSearch)
      );
    } catch (error) {
      console.error('Failed to search forms:', error);
      return [];
    }
  }
}