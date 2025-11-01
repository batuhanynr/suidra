export interface FormListedEvent {
  id: string;
  author: string;
  timestamp: number;
}

export interface FormDelistedEvent {
  form_id: string;
  author: string;
  timestamp: number;
}

export interface UserVotedEvent {
  id: string;
  author: string;
  user: string;
  timestamp: number;
}

export interface FormDeletedEvent {
  form_id: string;
  author: string;
  timestamp: number;
}

// Union type for all events
export type FormEvent = 
  | FormListedEvent 
  | FormDelistedEvent 
  | UserVotedEvent 
  | FormDeletedEvent;

// Event type identifiers
export enum FormEventType {
  FORM_LISTED = 'FormListed',
  FORM_DELISTED = 'FormDelisted', 
  USER_VOTED = 'UserVoted',
  FORM_DELETED = 'FormDeleted'
}