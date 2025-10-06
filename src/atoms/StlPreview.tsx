import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styled from 'styled-components';
import { theme } from '../theme/theme';
import * as THREE from 'three';

/**
 * Props for the StlPreview component.
 * @interface StlPreviewProps
 * @property {string} stl - The STL content as a string (ASCII or binary format).
 * @property {string} [aria-label] - An optional aria-label for the preview container.
 * @property {string} [data-testid] - An optional data-testid for testing purposes.
 */
interface StlPreviewProps {
  stl: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * A styled container for the Canvas to ensure proper sizing.
 */
const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${theme.colors.background};
`;

/**
 * Component that parses and renders an STL model.
 * This component handles the parsing of STL data and creates the Three.js geometry.
 */
const StlModel: React.FC<{ stl: string }> = ({ stl }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (!meshRef.current) return;

    try {
      // Parse STL data
      const parseStl = (stlString: string) => {
        // Check if string starts with "solid" (ASCII STL)
        const trimmed = stlString.trim();
        const isAscii = trimmed.toLowerCase().startsWith('solid');

        if (isAscii) {
          return parseAsciiStl(stlString);
        } else {
          return parseBinaryStl(stlString);
        }
      };

      const parseAsciiStl = (stlString: string) => {
        const vertices: number[] = [];
        const normals: number[] = [];

        const patternVertex =
          /vertex\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
        const patternNormal =
          /facet normal\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;

        let normalMatch;
        let vertexMatch;

        // Parse normals
        const normalMatches: number[][] = [];
        while ((normalMatch = patternNormal.exec(stlString)) !== null) {
          normalMatches.push([
            parseFloat(normalMatch[1]),
            parseFloat(normalMatch[2]),
            parseFloat(normalMatch[3]),
          ]);
        }

        // Parse vertices
        let normalIndex = 0;
        while ((vertexMatch = patternVertex.exec(stlString)) !== null) {
          vertices.push(
            parseFloat(vertexMatch[1]),
            parseFloat(vertexMatch[2]),
            parseFloat(vertexMatch[3])
          );

          // Assign normal to each vertex (3 vertices per facet)
          if (normalMatches[normalIndex]) {
            normals.push(
              normalMatches[normalIndex][0],
              normalMatches[normalIndex][1],
              normalMatches[normalIndex][2]
            );
          }

          // Move to next normal after 3 vertices
          if ((vertices.length / 3) % 3 === 0) {
            normalIndex++;
          }
        }

        return {
          vertices: new Float32Array(vertices),
          normals: new Float32Array(normals),
        };
      };

      const parseBinaryStl = (stlString: string) => {
        const buffer = new TextEncoder().encode(stlString).buffer;
        const view = new DataView(buffer);

        // Skip 80-byte header
        const numTriangles = view.getUint32(80, true);

        const vertices: number[] = [];
        const normals: number[] = [];

        let offset = 84;
        for (let i = 0; i < numTriangles; i++) {
          // Normal vector
          const nx = view.getFloat32(offset, true);
          const ny = view.getFloat32(offset + 4, true);
          const nz = view.getFloat32(offset + 8, true);
          offset += 12;

          // Three vertices
          for (let j = 0; j < 3; j++) {
            vertices.push(
              view.getFloat32(offset, true),
              view.getFloat32(offset + 4, true),
              view.getFloat32(offset + 8, true)
            );
            normals.push(nx, ny, nz);
            offset += 12;
          }

          // Skip attribute byte count
          offset += 2;
        }

        return {
          vertices: new Float32Array(vertices),
          normals: new Float32Array(normals),
        };
      };

      const { vertices, normals } = parseStl(stl);

      // Validate parsed data
      if (vertices.length === 0) {
        console.error('No vertices found in STL data');
        return;
      }

      // Create Three.js BufferGeometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

      // Compute bounding sphere for proper camera positioning
      geometry.computeBoundingSphere();

      meshRef.current.geometry = geometry;
    } catch (error) {
      console.error('Error parsing STL:', error);
    }
  }, [stl]);

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial color={theme.colors.accent} />
    </mesh>
  );
};

/**
 * Error boundary component for the Canvas
 */
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.text,
          }}
        >
          Error loading 3D preview:{' '}
          {this.state.error?.message || 'Unknown error'}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A React component that renders a 3D preview of an STL file.
 * It uses react-three-fiber and drei to provide a fully interactive 3D viewer
 * with rotate, pan, and zoom capabilities.
 *
 * @param {StlPreviewProps} props - The props for the component.
 * @returns {JSX.Element} A Canvas element that will contain the STL model.
 */
const StlPreview: React.FC<StlPreviewProps> = ({
  stl,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  return (
    <CanvasContainer aria-label={ariaLabel} data-testid={dataTestId}>
      <CanvasErrorBoundary>
        <Canvas camera={{ position: [0, 0, 100], fov: 50 }}>
          <Suspense fallback={null}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <ambientLight intensity={0.5} />
            {/* eslint-disable-next-line react/no-unknown-property */}
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <StlModel stl={stl} />
            <OrbitControls makeDefault />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </CanvasContainer>
  );
};

export default StlPreview;
