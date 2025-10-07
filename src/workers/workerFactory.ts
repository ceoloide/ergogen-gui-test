/**
 * Factory function for creating the Ergogen worker.
 * This is separated to make it easier to mock in tests.
 */

export const createErgogenWorker = (): Worker | null => {
  // Only create worker in browser environment
  if (typeof window === 'undefined' || !('Worker' in window)) {
    return null;
  }

  try {
    // Use the plain JavaScript worker from the public directory
    return new Worker('/ergogen.worker.js');
  } catch (e) {
    console.error('Failed to create worker:', e);
    return null;
  }
};
