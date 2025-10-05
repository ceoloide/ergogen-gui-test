// Global interface for the myjscad library loaded from openjscad.js
interface MyJscad {
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
}

declare global {
  interface Window {
    myjscad: MyJscad;
  }
}

/**
 * Converts a JSCAD script to STL format.
 * This function uses the global myjscad library (from openjscad.js)
 * to compile the JSCAD script and generate STL output.
 * The output format is ASCII STL, matching the behavior of @jscad/cli 1.10.0.
 *
 * @param jscadScript - The JSCAD script as a string
 * @returns A promise that resolves to the STL content as a string, or null if conversion fails
 */
export const convertJscadToStl = async (
  jscadScript: string
): Promise<string | null> => {
  try {
    if (!window.myjscad) {
      console.error('myjscad library is not loaded');
      return null;
    }

    if (!jscadScript || jscadScript.trim() === '') {
      console.error('JSCAD script is empty');
      return null;
    }

    // Initialize the processor
    window.myjscad.setup();

    // Compile the JSCAD script
    await window.myjscad.compile(jscadScript);

    // Generate STL output (ASCII format)
    // Format 'stla' is ASCII STL
    const output = window.myjscad.generateOutput('stla', null);

    // Extract the string from the wrapped result
    const stlContent = output.asBuffer().toString();

    if (!stlContent || stlContent.trim() === '') {
      console.error('Generated STL content is empty');
      return null;
    }

    return stlContent;
  } catch (error) {
    console.error('Error converting JSCAD to STL:', error);
    return null;
  }
};
