import React from 'react';
import styled from 'styled-components';

/**
 * Props for the TabPane component.
 * @typedef {object} TabPaneProps
 * @property {React.ReactComponentElement<any>} content - The content to be rendered inside the tab pane.
 * @property {string} [className] - An optional CSS class name for the pane.
 */
type TabPaneProps = {
  content: React.ReactComponentElement<any>;
  className?: string;
};

/**
 * A styled div that serves as the container for the tab content.
 * It is set to fill the available height of its parent.
 */
const Pane = styled.div`
  position: relative;
  height: 100%;
`;

/**
 * A component that represents a single pane within a tabbed interface.
 * It renders the content passed to it within a styled container.
 *
 * @param {TabPaneProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tab pane with its content.
 */
const TabPane = ({ content, className }: TabPaneProps) => {
  return <Pane className={className}>{content}</Pane>;
};

export default TabPane;
