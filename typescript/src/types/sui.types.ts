export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  data?: any;
}

export interface SuiObjectData {
  objectId: string;
  version: string;
  digest: string;
  content?: {
    dataType: string;
    type: string;
    hasPublicTransfer: boolean;
    fields: Record<string, any>;
  };
}

export interface TransactionOptions {
  gasBudget?: number;
  gasPrice?: number;
}

// Error constants matching the Move contract
export const CONTRACT_ERRORS = {
  EEmptyTitle: 1,
  ENotAuthor: 2, 
  EFormNotActive: 3,
  EFormAlreadyActive: 4,
  EInvalidOption: 5,
  EAlreadyVoted: 6
} as const;

export type ContractError = keyof typeof CONTRACT_ERRORS;