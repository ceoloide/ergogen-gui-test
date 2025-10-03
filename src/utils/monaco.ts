import { Monaco } from '@monaco-editor/react';

let themeDefined = false;

export const defineErgogenTheme = (monaco: Monaco) => {
  if (themeDefined) {
    return;
  }
  monaco.editor.defineTheme('ergogen-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#2d2d2d',
    },
  });
  themeDefined = true;
};
