import { Form, Question, CreateFormInput, AddQuestionInput } from "../types/form.types";

export class ValidationHelpers {
  
  /**
   * Validate form creation input
   * FRONTEND USE: Form validation in "Create New Form" modal/page
   */
  static validateCreateForm(input: CreateFormInput): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Form title is required');
    }

    if (input.title && input.title.length > 100) {
      errors.push('Form title must be less than 100 characters');
    }

    if (!input.description || input.description.trim().length === 0) {
      errors.push('Form description is required');
    }

    if (input.description && input.description.length > 500) {
      errors.push('Form description must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate question input
   * FRONTEND USE: Question creation form validation
   */
  static validateAddQuestion(input: AddQuestionInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Question title is required');
    }

    if (input.title && input.title.length > 200) {
      errors.push('Question title must be less than 200 characters');
    }

    if (!input.description || input.description.trim().length === 0) {
      errors.push('Question description is required');
    }

    if (!input.options || input.options.length < 2) {
      errors.push('At least 2 options are required');
    }

    if (input.options && input.options.length > 10) {
      errors.push('Maximum 10 options allowed');
    }

    if (input.options) {
      input.options.forEach((option, index) => {
        if (!option || option.trim().length === 0) {
          errors.push(`Option ${index + 1} cannot be empty`);
        }
        if (option && option.length > 100) {
          errors.push(`Option ${index + 1} must be less than 100 characters`);
        }
      });

      // Check for duplicate options
      const uniqueOptions = new Set(input.options.map(opt => opt.trim().toLowerCase()));
      if (uniqueOptions.size !== input.options.length) {
        errors.push('Options must be unique');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export class DataHelpers {
  
  /**
   * Format timestamp for display
   * FRONTEND USE: Display creation dates, voting times in readable format
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   * FRONTEND USE: Activity feeds, recent actions display
   */
  static getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return this.formatTimestamp(timestamp);
  }

  /**
   * Calculate voting statistics
   * FRONTEND USE: Charts, progress bars, result visualization
   */
  static calculateVotingStats(question: Question): {
    totalVotes: number;
    percentages: number[];
    winningOption: { index: number; option: string; percentage: number } | null;
  } {
    const totalVotes = question.votes?.reduce((sum, count) => sum + count, 0) || 0;
    
    if (totalVotes === 0) {
      return {
        totalVotes: 0,
        percentages: question.options?.map(() => 0) || [],
        winningOption: null,
      };
    }

    const percentages = question.votes?.map(count => (count / totalVotes) * 100) || [];
    
    const maxVotes = Math.max(...(question.votes || []));
    const winningIndex = question.votes?.findIndex(count => count === maxVotes) ?? -1;
    
    const winningOption = winningIndex >= 0 && question.options && question.options[winningIndex] 
      ? {
          index: winningIndex,
          option: question.options[winningIndex],
          percentage: percentages[winningIndex],
        }
      : null;

    return {
      totalVotes,
      percentages,
      winningOption,
    };
  }

  /**
   * Truncate text for display
   * FRONTEND USE: Card previews, list items, summaries
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Generate short ID for display
   * FRONTEND USE: Shortened form IDs in UI
   */
  static shortenId(id: string, length: number = 8): string {
    if (id.length <= length) return id;
    return `${id.substring(0, length / 2)}...${id.substring(id.length - length / 2)}`;
  }

  /**
   * Sort forms by different criteria
   * FRONTEND USE: Form listing page sorting options
   */
  static sortForms(forms: Form[], sortBy: 'newest' | 'oldest' | 'title' | 'mostQuestions'): Form[] {
    return [...forms].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.id.localeCompare(a.id); // Assuming newer objects have lexicographically larger IDs
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'mostQuestions':
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        default:
          return 0;
      }
    });
  }

  /**
   * Filter forms by search term
   * FRONTEND USE: Search functionality in form listing
   */
  static filterForms(forms: Form[], searchTerm: string): Form[] {
    if (!searchTerm.trim()) return forms;
    
    const lowercaseSearch = searchTerm.toLowerCase().trim();
    return forms.filter(form => 
      form.title.toLowerCase().includes(lowercaseSearch) ||
      form.description.toLowerCase().includes(lowercaseSearch) ||
      form.questions?.some(q => 
        q.title.toLowerCase().includes(lowercaseSearch) ||
        q.description.toLowerCase().includes(lowercaseSearch)
      )
    );
  }
}