/* eslint-env worker */
/* global self */

import * as ergogen from 'ergogen';
import { WorkerRequest } from './ergogen.worker.types';

console.log('Ergogen worker module starting...');

/**
 * Main worker message handler.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, inputConfig, injectionInput, requestId } = event.data || {};

  console.log(
    `Ergogen worker received a message: ${JSON.stringify(event.data)}`
  );

  if (type !== 'generate') {
    console.log('Unknown message type:', type);
    return;
  }

  const warnings: string[] = [];

  try {
    // Handle code injections if provided
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
          } catch (injectionError: unknown) {
            warnings.push(
              `Warning in injection ${inj_name}: ${
                (injectionError as Error).message || String(injectionError)
              }`
            );
          }
        }
      }
    }

    // Run Ergogen generation
    console.log('--- Running Ergogen ---');
    const results = await ergogen.process(
      inputConfig,
      true, // Set debug to true or no SVGs are generated
      (m: string) => console.log(m) // logger
    );
    console.log('--- Ergogen Finished ---');

    // Post success message with results and warnings
    self.postMessage({
      type: 'success',
      results,
      warnings,
      requestId,
    });
  } catch (e: unknown) {
    self.postMessage({
      type: 'error',
      error: (e as Error).message || String(e),
      requestId,
    });
  }
};

export {};
