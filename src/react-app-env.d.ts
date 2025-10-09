/// <reference types="react-scripts" />
/// <reference types="./gtag" />
declare namespace JSX {
  interface IntrinsicElements {
    'kicanvas-embed': {
      children?: Element;
      src?: string | null;
      controls?: string;
      controlslist?: string;
      theme?: string;
      zoom?: string;
      key?: string;
    };
    'kicanvas-source': {
      children?: string;
      type: string;
      originname?: string;
      src?: string;
    };
  }
}
