import React from 'react';
import { render, screen } from '@testing-library/react';
import FilePreview from './FilePreview';

// Mock the preview components
jest.mock('../atoms/StlPreview', () => ({
  __esModule: true,
  default: ({
    stl,
    'data-testid': dataTestId,
  }: {
    stl: string;
    'data-testid'?: string;
  }) => <div data-testid={dataTestId}>STL Preview: {stl.substring(0, 20)}</div>,
}));

jest.mock('../atoms/JscadPreview', () => ({
  __esModule: true,
  default: ({
    jscad,
    'data-testid': dataTestId,
  }: {
    jscad: string;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId}>JSCAD Preview: {jscad.substring(0, 20)}</div>
  ),
}));

jest.mock('../atoms/TextPreview', () => ({
  __esModule: true,
  default: ({
    content,
    'data-testid': dataTestId,
  }: {
    content: string;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId}>Text Preview: {content.substring(0, 20)}</div>
  ),
}));

jest.mock('../atoms/SvgPreview', () => ({
  __esModule: true,
  default: ({
    'data-testid': dataTestId,
  }: {
    svg: string;
    'data-testid'?: string;
  }) => <div data-testid={dataTestId}>SVG Preview</div>,
}));

jest.mock('../atoms/PcbPreview', () => ({
  __esModule: true,
  default: ({
    'data-testid': dataTestId,
  }: {
    pcb: string;
    'data-testid'?: string;
  }) => <div data-testid={dataTestId}>PCB Preview</div>,
}));

describe('FilePreview', () => {
  describe('STL preview conditional rendering', () => {
    const mockStlContent = 'solid test\nfacet normal 0 0 1\nendsolid';

    it('should render STL preview when stlPreview is true', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="stl"
          previewKey="test.stl"
          previewContent={mockStlContent}
          stlPreview={true}
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-stl')).toBeInTheDocument();
      expect(screen.getByText(/STL Preview:/)).toBeInTheDocument();
    });

    it('should render text preview when stlPreview is false', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="stl"
          previewKey="test.stl"
          previewContent={mockStlContent}
          stlPreview={false}
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-stl-text')).toBeInTheDocument();
      expect(screen.getByText(/Text Preview:/)).toBeInTheDocument();
    });

    it('should render text preview when stlPreview is undefined', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="stl"
          previewKey="test.stl"
          previewContent={mockStlContent}
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-stl-text')).toBeInTheDocument();
      expect(screen.getByText(/Text Preview:/)).toBeInTheDocument();
    });
  });

  describe('JSCAD preview conditional rendering', () => {
    const mockJscadContent = 'function main() { return cube(); }';

    it('should render JSCAD preview when jscadPreview is true', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="jscad"
          previewKey="test.jscad"
          previewContent={mockJscadContent}
          jscadPreview={true}
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-jscad')).toBeInTheDocument();
      expect(screen.getByText(/JSCAD Preview:/)).toBeInTheDocument();
    });

    it('should render text preview when jscadPreview is false', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="jscad"
          previewKey="test.jscad"
          previewContent={mockJscadContent}
          jscadPreview={false}
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-jscad-text')).toBeInTheDocument();
      expect(screen.getByText(/Text Preview:/)).toBeInTheDocument();
    });
  });

  describe('Other file types', () => {
    it('should render SVG preview for svg extension', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="svg"
          previewKey="test.svg"
          previewContent="<svg></svg>"
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-svg')).toBeInTheDocument();
    });

    it('should render text preview for yaml extension', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="yaml"
          previewKey="test.yaml"
          previewContent="key: value"
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByTestId('file-preview-yaml')).toBeInTheDocument();
    });

    it('should render "No preview available" for unknown extension', () => {
      // Arrange & Act
      render(
        <FilePreview
          previewExtension="unknown"
          previewKey="test.unknown"
          previewContent="content"
          data-testid="file-preview"
        />
      );

      // Assert
      expect(screen.getByText('No preview available')).toBeInTheDocument();
    });
  });
});
