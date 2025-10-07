/**
 * Type definitions for messages between the Ergogen worker and main thread.
 */

export type WorkerRequest = {
  type: 'generate';
  inputConfig: string | object;
  injectionInput?: string[][];
};

export type WorkerResponse =
  | {
      type: 'success';
      results: unknown;
      warnings: string[];
    }
  | {
      type: 'error';
      error: string;
    };
