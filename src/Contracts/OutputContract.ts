export interface OutputContract {
  /**
   * Registers the event-based output controller.
   */
  register(): Promise<void>;
}
