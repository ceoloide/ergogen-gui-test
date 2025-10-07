/**
 * Web Worker for running Ergogen generation asynchronously.
 * This prevents the main UI thread from being blocked during intensive processing.
 */

/* eslint-env worker */
/* global self, importScripts */

// Load dependencies in the worker context
try {
  self.importScripts('/dependencies/ergogen.js');
} catch (e) {
  // If ergogen.js fails to load, post an error
  self.postMessage({
    type: 'error',
    error: 'Failed to load ergogen.js: ' + (e.message || e.toString()),
  });
}

/**
 * Main worker message handler.
 */
self.addEventListener('message', async (event) => {
  const { type, inputConfig, injectionInput } = event.data;

  if (type !== 'generate') {
    return;
  }

  // Initialize warnings array (currently not populated, reserved for future use)
  const warnings = [];

  try {
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
          try {
            const inj_value = new Function(
              'require',
              module_prefix + inj_text + module_suffix
            )();
            self.ergogen.inject(inj_type, inj_name, inj_value);
          } catch (injectionError) {
            // Add injection warning and continue
            warnings.push(
              `Warning in injection ${inj_name}: ${injectionError.message || injectionError.toString()}`
            );
          }
        }
      }
    }

    // Run Ergogen generation
    const results = await self.ergogen.process(
      inputConfig,
      true, // Set debug to true or no SVGs are generated
      (m) => console.log(m) // logger
    );

    // Post success message with results and warnings
    self.postMessage({
      type: 'success',
      results,
      warnings,
    });
  } catch (e) {
    let errorMessage = 'Unknown error occurred';

    if (typeof e === 'string') {
      errorMessage = e;
    } else if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'object' && e !== null) {
      errorMessage = e.toString();
    }

    self.postMessage({
      type: 'error',
      error: errorMessage,
    });
  }
});
