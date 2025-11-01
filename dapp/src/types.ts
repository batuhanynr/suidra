// Simple types for our MVP
export interface Question {
  id: string;
  title: string;
  description: string;
  options: string[];
  creator: string;
  image?: string; // Base64 encoded image or URL
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: string[]; // Question IDs
  creator: string;
  isActive: boolean;
}

export interface FormResponse {
  formId: string;
  questionId: string;
  answer: string;
  responder: string;
}