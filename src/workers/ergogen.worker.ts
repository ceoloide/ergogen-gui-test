/**
 * Web Worker for running Ergogen generation asynchronously.
 * This prevents the main UI thread from being blocked during intensive processing.
 */

/* eslint-env worker */
 

// Extend worker global scope with importScripts and ergogen
interface WorkerGlobalScopeWithImport {
  importScripts: (...urls: string[]) => void;
  addEventListener: (
    type: string,
    listener: (event: MessageEvent<WorkerRequest>) => void
  ) => void;
  postMessage: (message: WorkerResponse) => void;
  ergogen: {
    inject: (type: string, name: string, value: unknown) => void;
    process: (
      config: unknown,
      debug: boolean,
      logger: (m: string) => void
    ) => Promise<unknown>;
  };
}

// Type cast to access worker-specific APIs
const workerSelf = self as unknown as WorkerGlobalScopeWithImport;

// Load dependencies in the worker context
workerSelf.importScripts('/dependencies/ergogen.js');

// Type definitions for messages between worker and main thread
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

/**
 * Main worker message handler.
 */
workerSelf.addEventListener(
  'message',
  async (event: MessageEvent<WorkerRequest>) => {
    const { type, inputConfig, injectionInput, deprecationWarning } =
      event.data;

    if (type !== 'generate') {
      return;
    }

    try {
      // Post deprecation warning if provided
      if (deprecationWarning) {
        workerSelf.postMessage({
          type: 'warning',
          warning: deprecationWarning,
        } as WorkerResponse);
      }

      // Process injections
      if (injectionInput !== undefined && Array.isArray(injectionInput)) {
        for (let i = 0; i < injectionInput.length; i++) {
          const injection = injectionInput[i];
          if (Array.isArray(injection) && injection.length === 3) {
            const inj_type = injection[0];
            const inj_name = injection[1];
            const inj_text = injection[2];
            const module_prefix = 'const module = {};\n\n';
            const module_suffix = '\n\nreturn module.exports;';
            const inj_value = new Function(
              'require',
              module_prefix + inj_text + module_suffix
            )();
            workerSelf.ergogen.inject(inj_type, inj_name, inj_value);
          }
        }
      }

      // Run Ergogen generation
      const results = await workerSelf.ergogen.process(
        inputConfig,
        true, // Set debug to true or no SVGs are generated
        (m: string) => console.log(m) // logger
      );

      // Post success message with results
      workerSelf.postMessage({
        type: 'success',
        results,
      } as WorkerResponse);
    } catch (e: unknown) {
      let errorMessage = 'Unknown error occurred';

      if (typeof e === 'string') {
        errorMessage = e;
      } else if (typeof e === 'object' && e !== null) {
        errorMessage = e.toString();
      }

      workerSelf.postMessage({
        type: 'error',
        error: errorMessage,
      } as WorkerResponse);
    }
  }
);

// Export empty object to make this a module
export {};
