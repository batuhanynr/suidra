import { suiClient } from "../suiClient";
import { FormEvent, FormEventType } from "../types/events.types";
import { EVENTS } from "../utils/constants";

export class EventService {
  
  /**
   * Subscribe to form events for real-time updates
   * FRONTEND USE: Real-time notifications, live vote counts, form status updates
   */
  static async subscribeToFormEvents(
    callback: (event: FormEvent) => void,
    eventTypes?: FormEventType[]
  ): Promise<() => void> {
    const eventFilters = eventTypes 
      ? eventTypes.map(type => ({ MoveEventType: EVENTS[type as keyof typeof EVENTS] as string }))
      : Object.values(EVENTS).map(event => ({ MoveEventType: event }));

    const unsubscribe = await suiClient.subscribeEvent({
      filter: {
        Any: eventFilters,
      },
      onMessage: (event) => {
        const parsedEvent = this.parseEvent(event);
        if (parsedEvent) {
          callback(parsedEvent);
        }
      },
    });

    return unsubscribe;
  }

  /**
   * Get historical events for a specific form
   * FRONTEND USE: Activity timeline, audit log, form history page
   */
  static async getFormEvents(
    formId: string,
    eventTypes?: FormEventType[]
  ): Promise<FormEvent[]> {
    try {
      const eventFilters = eventTypes 
        ? eventTypes.map(type => ({ MoveEventType: EVENTS[type as keyof typeof EVENTS] as string }))
        : Object.values(EVENTS).map(event => ({ MoveEventType: event }));

      const events = await suiClient.queryEvents({
        query: {
          Any: eventFilters,
        },
        limit: 100,
        order: 'descending',
      });

      return events.data
        .map(event => this.parseEvent(event))
        .filter((event): event is FormEvent => event !== null)
        .filter(event => this.isEventRelatedToForm(event, formId));
    } catch (error) {
      console.error('Failed to get form events:', error);
      return [];
    }
  }

  /**
   * Get all recent events across all forms
   * FRONTEND USE: Dashboard activity feed, admin panel, global notifications
   */
  static async getRecentEvents(limit: number = 50): Promise<FormEvent[]> {
    try {
      const events = await suiClient.queryEvents({
        query: {
          Any: Object.values(EVENTS).map(event => ({ MoveEventType: event })),
        },
        limit,
        order: 'descending',
      });

      return events.data
        .map(event => this.parseEvent(event))
        .filter((event): event is FormEvent => event !== null);
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }

  /**
   * Parse raw Sui event to typed FormEvent
   * FRONTEND USE: Data transformation for UI components
   */
  private static parseEvent(rawEvent: any): FormEvent | null {
    try {
      const eventType = rawEvent.type;
      const parsedJson = rawEvent.parsedJson;

      if (!parsedJson) return null;

      switch (eventType) {
        case EVENTS.FORM_LISTED:
          return {
            id: parsedJson.id,
            author: parsedJson.author,
            timestamp: parsedJson.timestamp,
          } as FormEvent;

        case EVENTS.FORM_DELISTED:
          return {
            form_id: parsedJson.form_id,
            author: parsedJson.author,
            timestamp: parsedJson.timestamp,
          } as FormEvent;

        case EVENTS.USER_VOTED:
          return {
            id: parsedJson.id,
            author: parsedJson.author,
            user: parsedJson.user,
            timestamp: parsedJson.timestamp,
          } as FormEvent;

        case EVENTS.FORM_DELETED:
          return {
            form_id: parsedJson.form_id,
            author: parsedJson.author,
            timestamp: parsedJson.timestamp,
          } as FormEvent;

        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to parse event:', error);
      return null;
    }
  }

  /**
   * Check if event is related to specific form
   */
  private static isEventRelatedToForm(event: FormEvent, formId: string): boolean {
    if ('id' in event && event.id === formId) return true;
    if ('form_id' in event && event.form_id === formId) return true;
    return false;
  }
}