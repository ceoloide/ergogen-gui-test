import { convertJscadToStl } from './jscad';

describe('convertJscadToStl', () => {
  const mockSetup = jest.fn();
  const mockCompile = jest.fn();
  const mockGenerateOutput = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the global myjscad object on window
    Object.defineProperty(window, 'myjscad', {
      writable: true,
      configurable: true,
      value: {
        setup: mockSetup,
        compile: mockCompile,
        generateOutput: mockGenerateOutput,
      },
    });
  });

  afterEach(() => {
    // Clean up
    delete (window as { myjscad?: unknown }).myjscad;
  });

  it('should return null for empty script', async () => {
    // Arrange
    const jscadScript = '';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const result = await convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('JSCAD script is empty');

    consoleSpy.mockRestore();
  });

  it('should return null when myjscad is not loaded', async () => {
    // Arrange
    delete (window as { myjscad?: unknown }).myjscad;
    const jscadScript = 'function main() { return cube(); }';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const result = await convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('myjscad library is not loaded');

    consoleSpy.mockRestore();
  });

  it('should successfully convert JSCAD to STL', async () => {
    // Arrange
    const jscadScript = 'function main() { return cube(); }';
    const stlContent = 'solid exported\nfacet normal 0 0 1\nendsolid';

    mockCompile.mockResolvedValue('dummy');
    mockGenerateOutput.mockReturnValue({
      asBuffer: () => ({
        toString: () => stlContent,
      }),
    });

    // Act
    const result = await convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBe(stlContent);
    expect(mockSetup).toHaveBeenCalled();
    expect(mockCompile).toHaveBeenCalledWith(jscadScript);
    expect(mockGenerateOutput).toHaveBeenCalledWith('stla', null);
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const jscadScript = 'function main() { return cube(); }';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockCompile.mockRejectedValue(new Error('test error'));

    // Act
    const result = await convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should return null when generated STL is empty', async () => {
    // Arrange
    const jscadScript = 'function main() { return cube(); }';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    mockCompile.mockResolvedValue('dummy');
    mockGenerateOutput.mockReturnValue({
      asBuffer: () => ({
        toString: () => '',
      }),
    });

    // Act
    const result = await convertJscadToStl(jscadScript);

    // Assert
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Generated STL content is empty');

    consoleSpy.mockRestore();
  });
});
