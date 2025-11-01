export interface Form {
  id: string;
  title: string;
  description: string;
  author: string;
  questions: Question[];
  is_active: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  options: string[];
  votes: number[];
  addresses: string[];
}

export interface FormMetadata {
  id: string;
  timestamp: number;
}

export interface FormRegistry {
  id: string;
  forms: string[];
  counter: number;
}

// Form creation input types
export interface CreateFormInput {
  title: string;
  description: string;
}

export interface AddQuestionInput {
  title: string;
  description: string;
  options: string[];
}

export interface VoteInput {
  questionId: string;
  optionIndex: number;
}