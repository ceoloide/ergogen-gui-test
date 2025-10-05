import { serialize as serializeSTL } from '@jscad/stl-serializer';

// Import the @jscad/csg library for type references
// The actual execution uses the global openjscad library
declare const require: (module: string) => unknown;

/**
 * Converts a JSCAD script to STL format.
 * This function executes the JSCAD script to generate CSG geometry,
 * then serializes it to ASCII STL format using @jscad/stl-serializer 0.1.3
 * (matching the version used by @jscad/cli 1.10.0).
 *
 * @param jscadScript - The JSCAD script as a string
 * @returns The STL content as a string, or null if conversion fails
 */
export const convertJscadToStl = (jscadScript: string): string | null => {
  try {
    // Load the CSG library from @jscad/csg
    const { CSG, CAG } = require('@jscad/csg');
    const oscad = require('@jscad/csg/api');

    // Create a function from the JSCAD script
    // JSCAD scripts typically use 'function main()' pattern
    const scriptFunction = new Function(
      'CSG',
      'CAG',
      ...Object.keys(oscad),
      `
      ${jscadScript}
      // If the script defines a main() function, call it
      if (typeof main === 'function') {
        return main();
      }
      // Otherwise, return undefined
      return undefined;
      `
    );

    // Execute the script with the CSG/CAG constructors and API functions
    const geometries = scriptFunction(CSG, CAG, ...Object.values(oscad));

    if (!geometries) {
      console.error('JSCAD script did not return any geometry');
      return null;
    }

    // Ensure we have an array of geometries
    const geomArray = Array.isArray(geometries) ? geometries : [geometries];

    if (geomArray.length === 0) {
      console.error('JSCAD script returned empty geometry array');
      return null;
    }

    // Convert to ASCII STL format
    // The serialize function returns an array buffer or string
    const stlData = serializeSTL(geomArray, { binary: false });

    // If stlData is a string, return it directly
    if (typeof stlData === 'string') {
      return stlData;
    }

    // If it's an array buffer, convert it to string
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(stlData);
  } catch (error) {
    console.error('Error converting JSCAD to STL:', error);
    return null;
  }
};
