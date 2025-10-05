import { convertJscadToStl } from './jscad';

// Mock the @jscad/csg and @jscad/stl-serializer modules
jest.mock('@jscad/csg', () => {
  // Simple mock CSG class
  class CSG {
    static cube() {
      return new CSG();
    }
  }
  class CAG {}
  return { CSG, CAG };
});

jest.mock('@jscad/csg/api', () => ({
  cube: jest.fn(() => ({})),
  sphere: jest.fn(() => ({})),
  cylinder: jest.fn(() => ({})),
}));

jest.mock('@jscad/stl-serializer', () => ({
  serialize: jest.fn(() => 'solid exported\n  facet normal 0 0 1\n  endsolid'),
}));

describe('convertJscadToStl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null for empty script', () => {
    // Arrange
    const jscadScript = '';

    // Act
    const result = convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null when script does not define main function', () => {
    // Arrange
    const jscadScript = 'const x = 1;';

    // Act
    const result = convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
  });

  it('should handle errors gracefully', () => {
    // Arrange
    const jscadScript = 'throw new Error("test error");';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const result = convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
