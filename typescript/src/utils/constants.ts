import { ENV } from '../env';

// Contract addresses and identifiers
export const CONTRACTS = {
  PACKAGE_ID: ENV.PACKAGE_ID,
  MODULE_NAME: 'forms::form',
  REGISTRY_ID: ENV.FORMS_REGISTRY_ID,
} as const;

// Function names matching the Move contract
export const FUNCTIONS = {
  CREATE_FORM: 'create_form',
  TRANSFER_FORM_TO_CREATOR: 'transfer_form_to_creator',
  LIST_FORM: 'list_form', 
  DELIST_FORM: 'delist_form',
  RELIST_FORM: 'relist_form',
  ADD_QUESTION: 'add_question',
  VOTE_QUESTION: 'vote_question',
  FORM_REGISTRY_IDS: 'form_registry_ids'
} as const;

// Struct names matching the Move contract  
export const STRUCTS = {
  FORM: `${CONTRACTS.PACKAGE_ID}::form::Form`,
  QUESTION: `${CONTRACTS.PACKAGE_ID}::form::Question`, 
  FORM_METADATA: `${CONTRACTS.PACKAGE_ID}::form::FormMetadata`,
  FORM_REGISTRY: `${CONTRACTS.PACKAGE_ID}::form::FormRegistry`
} as const;

// Event names matching the Move contract
export const EVENTS = {
  FORM_LISTED: `${CONTRACTS.PACKAGE_ID}::form::FormListed`,
  FORM_DELISTED: `${CONTRACTS.PACKAGE_ID}::form::FormDelisted`,
  USER_VOTED: `${CONTRACTS.PACKAGE_ID}::form::UserVoted`, 
  FORM_DELETED: `${CONTRACTS.PACKAGE_ID}::form::FormDeleted`
} as const;

// Gas configuration
export const GAS_CONFIG = {
  DEFAULT_BUDGET: 10_000_000, // 0.01 SUI
  MAX_BUDGET: 100_000_000,    // 0.1 SUI
} as const;