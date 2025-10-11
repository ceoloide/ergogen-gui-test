/**
 * Type definitions for messages between the JSCAD worker and main thread.
 *
 * The worker processes JSCAD to STL conversions in batches to avoid race conditions
 * and ensure results are applied in the correct order using config version tracking.
 */

/**
 * Request sent to JSCAD worker to convert a batch of JSCAD cases to STL format.
 */
export type JscadWorkerRequest = {
  type: 'batch_jscad_to_stl';
  /** Array of cases to convert, each with a name and JSCAD code */
  cases: Array<{ name: string; jscad: string }>;
  /** Config version to track which generation this batch belongs to */
  configVersion: number;
};

/**
 * Response from JSCAD worker after processing a batch conversion.
 */
export type JscadWorkerResponse = {
  type: 'success' | 'error';
  /** On success, contains converted STL data for each case */
  cases?: Record<string, { jscad: string; stl: string }>;
  /** On error, contains the error message */
  error?: string;
  /** Echo of the config version from the request */
  configVersion: number;
};
