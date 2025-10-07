/* eslint-env worker */
/* global self */

import * as ergogen from 'ergogen';
import { WorkerRequest } from './ergogen.worker.types';

console.log('Ergogen worker module starting...');

/**
 * Main worker message handler.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, inputConfig, injectionInput, requestId } =
    event.data || {};

  console.log(`Ergogen worker received a message: ${JSON.stringify(event.data)}`);
  console.log('Ergogen worker returning a dummy error.');
  self.postMessage({
    type: 'error',
    error: 'Not implemented yet >.<',
    requestId,
  });

  // HINT: It's OK that the code below is unreachable for now. We are testing a theory.

  if (type !== 'generate') {
    console.log('Unknown message type:', type);
    return;
  }

  const warnings: string[] = [];

  try {
    // Process injections
    if (injectionInput && Array.isArray(injectionInput)) {
      for (const injection of injectionInput) {
        if (Array.isArray(injection) && injection.length === 3) {
          const [inj_type, inj_name, inj_text] = injection;
          const module_prefix = 'const module = {};\n\n';
          const module_suffix = '\n\nreturn module.exports;';
          try {
            const inj_value = new Function(
              'require',
              module_prefix + inj_text + module_suffix
            )();
            ergogen.inject(inj_type, inj_name, inj_value);
          } catch (injectionError: any) {
            warnings.push(
              `Warning in injection ${inj_name}: ${
                injectionError.message || injectionError.toString()
              }`
            );
          }
        }
      }
    }

    // Run Ergogen generation
    const results = await ergogen.process(
      inputConfig,
      true, // Set debug to true or no SVGs are generated
      (m: string) => console.log(m) // logger
    );

    // Post success message with results and warnings
    self.postMessage({
      type: 'success',
      results,
      warnings,
      requestId,
    });
  } catch (e: any) {
    self.postMessage({
      type: 'error',
      error: e.message || e.toString(),
      requestId,
    });
  }
};

export {};
