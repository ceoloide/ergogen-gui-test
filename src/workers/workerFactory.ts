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
    // Prefer absolute path relative to the current origin to support subpath deployments
    const workerUrl = new URL('/ergogen.worker.js', window.location.origin);
    return new Worker(workerUrl.toString());
  } catch (e) {
    console.error('Failed to create worker:', e);
    return null;
  }
};
