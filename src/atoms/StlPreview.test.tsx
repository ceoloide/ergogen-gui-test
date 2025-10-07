import { render, screen } from '@testing-library/react';
import StlPreview from './StlPreview';

// Mock react-three-fiber and drei
jest.mock('@react-three/fiber', () => {
  const THREE = jest.requireActual('three');
  return {
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-canvas">{children}</div>
    ),
    useThree: () => ({
      camera: new THREE.PerspectiveCamera(),
      size: { width: 100, height: 100 },
      controls: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    }),
  };
});

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-html">{children}</div>
  ),
}));

describe('StlPreview', () => {
  // Arrange
  const mockStl = `solid test
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
endsolid test`;

  it('renders the STL preview container', () => {
    // Act
    render(<StlPreview stl={mockStl} data-testid="stl-preview-test" />);

    // Assert
    expect(screen.getByTestId('stl-preview-test')).toBeInTheDocument();
  });

  it('renders with correct aria-label', () => {
    // Act
    render(
      <StlPreview
        stl={mockStl}
        aria-label="Test STL preview"
        data-testid="stl-preview-test"
      />
    );

    // Assert
    const container = screen.getByTestId('stl-preview-test');
    expect(container).toHaveAttribute('aria-label', 'Test STL preview');
  });

  it('renders the Canvas component', () => {
    // Act
    render(<StlPreview stl={mockStl} />);

    // Assert
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
  });
});
