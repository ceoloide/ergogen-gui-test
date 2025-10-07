/**
 * Type definitions for messages between the Ergogen worker and main thread.
 */

export type WorkerRequest = {
  type: 'generate';
  inputConfig: string | object;
  injectionInput?: string[][];
  deprecationWarning?: string | null;
};

export type WorkerResponse =
  | {
      type: 'success';
      results: unknown;
    }
  | {
      type: 'error';
      error: string;
    }
  | {
      type: 'warning';
      warning: string;
    };
