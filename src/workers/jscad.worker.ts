/* eslint-env worker */
/* global self */

import { JscadWorkerRequest, JscadWorkerResponse } from './jscad.worker.types';

// The JSCAD library is loaded via importScripts and attaches itself to the global scope.
// We need to declare its existence and shape for TypeScript.
declare global {
  const myjscad: {
    setup: () => void;
    compile: (code: string) => Promise<string>;
    generateOutput: (
      format: string,
      geometry: unknown
    ) => {
      asBuffer: () => {
        toString: () => string;
      };
    };
  };
}

// Load the JSCAD library. The path is relative to the deployed root.
// The script is in public/dependencies/openjscad.js
try {
  // In a worker, 'self' is the global scope. openjscad.js seems to expect a 'window' object
  // and attaches 'myjscad' to it. 'self.window' is an alias for 'self', so this should work.
  // We also need to initialize myjscad as an object, just like in index.html
  (self as any).myjscad = {};
  importScripts('/dependencies/openjscad.js');
} catch (e) {
  // If the script fails to load, set up a message handler that reports the error.
  self.onmessage = (event: MessageEvent<JscadWorkerRequest>) => {
    const response: JscadWorkerResponse = {
      type: 'error',
      error: `Failed to load JSCAD library in worker: ${String(e)}`,
      requestId: event.data.requestId,
    };
    self.postMessage(response);
  };
  // We should not continue if the library failed to load.
  throw e;
}

/**
 * Main worker message handler.
 */
self.onmessage = async (event: MessageEvent<JscadWorkerRequest>) => {
  const { type, jscad, requestId } = event.data || {};

  if (type !== 'jscad_to_stl') {
    const response: JscadWorkerResponse = {
      type: 'error',
      error: `Unknown message type: ${type}`,
      requestId,
    };
    self.postMessage(response);
    return;
  }

  try {
    if (!myjscad) {
      throw new Error('myjscad library is not loaded or initialized correctly.');
    }

    if (!jscad || jscad.trim() === '') {
      throw new Error('JSCAD script is empty.');
    }

    // This logic is adapted from the original convertJscadToStl utility function.
    myjscad.setup();
    await myjscad.compile(jscad);
    const output = myjscad.generateOutput('stla', null); // 'stla' for ASCII STL
    const stlContent = output.asBuffer().toString();

    if (!stlContent || stlContent.trim() === '') {
      throw new Error('Generated STL content is empty.');
    }

    const response: JscadWorkerResponse = {
      type: 'success',
      stl: stlContent,
      requestId,
    };
    self.postMessage(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const response: JscadWorkerResponse = {
      type: 'error',
      error: `JSCAD to STL conversion failed: ${errorMessage}`,
      requestId,
    };
    self.postMessage(response);
  }
};

// Export empty object to satisfy TypeScript's module requirement
export {};