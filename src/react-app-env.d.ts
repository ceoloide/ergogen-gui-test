/// <reference types="react-scripts" />
declare namespace JSX {
  interface IntrinsicElements {
      'kicanvas-embed': { 
        'children'?: Element,
        'src'?: string | null,
        'controls'?: string,
        'controlslist'?: string,
        'theme'?: string,
        'zoom'?: string,
      };
      'kicanvas-source': { 
        'children'?: string,
        'type'?: string,
        'originname'?: string,
      };
  }
}