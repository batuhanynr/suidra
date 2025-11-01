import { CONTRACT_ERRORS, ContractError } from "../types/sui.types";

export class ErrorHandler {
  
  /**
   * Convert contract error codes to user-friendly messages
   * FRONTEND USE: Error notifications, form validation feedback
   */
  static getErrorMessage(error: string | ContractError | number): string {
    // Handle contract error codes
    if (typeof error === 'number') {
      switch (error) {
        case CONTRACT_ERRORS.EEmptyTitle:
          return 'Title cannot be empty';
        case CONTRACT_ERRORS.ENotAuthor:
          return 'You are not the author of this form';
        case CONTRACT_ERRORS.EFormNotActive:
          return 'This form is not currently active';
        case CONTRACT_ERRORS.EFormAlreadyActive:
          return 'This form is already active';
        case CONTRACT_ERRORS.EInvalidOption:
          return 'Invalid option selected';
        case CONTRACT_ERRORS.EAlreadyVoted:
          return 'You have already voted on this question';
        default:
          return 'Unknown contract error occurred';
      }
    }

    // Handle string errors
    if (typeof error === 'string') {
      // Parse Move abort codes from error messages
      const abortMatch = error.match(/Move abort in .* Abort\((\d+)\)/);
      if (abortMatch) {
        const abortCode = parseInt(abortMatch[1]);
        return this.getErrorMessage(abortCode);
      }

      // Common Sui error patterns
      if (error.includes('Insufficient gas')) {
        return 'Insufficient gas to complete transaction. Please try again with more gas.';
      }
      
      if (error.includes('Object does not exist')) {
        return 'The requested form or object no longer exists.';
      }
      
      if (error.includes('Invalid signature')) {
        return 'Transaction signature is invalid. Please check your wallet connection.';
      }
      
      if (error.includes('Network error')) {
        return 'Network connection error. Please check your internet connection and try again.';
      }

      // Return original error if no pattern matches
      return error;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Determine error severity for UI styling
   * FRONTEND USE: Error notification styling (warning, error, info)
   */
  static getErrorSeverity(error: string | ContractError | number): 'error' | 'warning' | 'info' {
    if (typeof error === 'number') {
      switch (error) {
        case CONTRACT_ERRORS.EEmptyTitle:
        case CONTRACT_ERRORS.EInvalidOption:
          return 'warning';
        case CONTRACT_ERRORS.ENotAuthor:
        case CONTRACT_ERRORS.EAlreadyVoted:
          return 'error';
        case CONTRACT_ERRORS.EFormNotActive:
        case CONTRACT_ERRORS.EFormAlreadyActive:
          return 'info';
        default:
          return 'error';
      }
    }

    if (typeof error === 'string') {
      if (error.includes('Insufficient gas') || error.includes('Network error')) {
        return 'warning';
      }
      if (error.includes('Object does not exist') || error.includes('Invalid signature')) {
        return 'error';
      }
    }

    return 'error';
  }

  /**
   * Check if error is retryable
   * FRONTEND USE: Show retry button in error messages
   */
  static isRetryableError(error: string | ContractError | number): boolean {
    if (typeof error === 'number') {
      switch (error) {
        case CONTRACT_ERRORS.ENotAuthor:
        case CONTRACT_ERRORS.EAlreadyVoted:
          return false; // These are permanent errors
        default:
          return true;
      }
    }

    if (typeof error === 'string') {
      if (error.includes('Network error') || error.includes('Insufficient gas')) {
        return true;
      }
      if (error.includes('Object does not exist') || error.includes('Invalid signature')) {
        return false;
      }
    }

    return true; // Default to retryable for unknown errors
  }

  /**
   * Get suggested action for error recovery
   * FRONTEND USE: Action buttons in error dialogs
   */
  static getSuggestedAction(error: string | ContractError | number): string | null {
    if (typeof error === 'number') {
      switch (error) {
        case CONTRACT_ERRORS.EEmptyTitle:
          return 'Please enter a valid title';
        case CONTRACT_ERRORS.ENotAuthor:
          return 'Switch to the author account';
        case CONTRACT_ERRORS.EFormNotActive:
          return 'Activate the form first';
        case CONTRACT_ERRORS.EFormAlreadyActive:
          return 'Form is already active';
        case CONTRACT_ERRORS.EInvalidOption:
          return 'Select a valid option';
        case CONTRACT_ERRORS.EAlreadyVoted:
          return 'You can only vote once';
        default:
          return null;
      }
    }

    if (typeof error === 'string') {
      if (error.includes('Insufficient gas')) {
        return 'Increase gas budget and try again';
      }
      if (error.includes('Network error')) {
        return 'Check your connection and retry';
      }
      if (error.includes('Invalid signature')) {
        return 'Reconnect your wallet';
      }
    }

    return null;
  }
}