import React from 'react';

/**
 * A React component that renders a download icon as an SVG.
 * This icon is typically used in buttons or links to indicate a download action.
 * It is a stateless functional component.
 *
 * @returns {JSX.Element} The download SVG icon.
 */
const DownloadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default DownloadIcon;
