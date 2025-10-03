import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';
import TabPane from '../molecules/TabPane';
import styled from 'styled-components';

/**
 * Props for a single tab pane within the Tabs component.
 * @typedef {object} TabPaneProps
 * @property {string} label - The text to be displayed on the tab button.
 * @property {React.ReactComponentElement<any>} content - The component to be rendered as the content of the tab pane.
 */
type TabPaneProps = {
  label: string;
  content: React.ReactComponentElement<any>;
};

/**
 * Props for the main Tabs component.
 * @typedef {object} TabsProps
 * @property {Array<TabPaneProps>} tabs - An array of tab pane configurations.
 */
type TabsProps = {
  tabs: Array<TabPaneProps>;
};

/**
 * A styled container for the tab buttons.
 */
const TabContainer = styled.div`
  display: flex;
  align-content: space-between;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  overflow: hidden;
`;

/**
 * A styled div representing a single, clickable tab button.
 */
const Tab = styled.div`
  display: flex;
  background: #595959;
  padding: 0.5rem 1rem;
  flex-grow: 1;
  justify-content: center;
  align-content: center;
  cursor: pointer;
  transition: background-color 150ms ease-in-out;

  &:hover {
    background: #525252;
  }

  &:active {
    background: #595959;
  }
`;

/**
 * Defines the shape of the context provided by the Tabs component.
 * @typedef {object} ContextProps
 * @property {number | undefined} tabIndex - The index of the currently active tab.
 * @property {Dispatch<SetStateAction<number>>} setTabIndex - Function to set the active tab index.
 */
type ContextProps = {
  tabIndex: number | undefined;
  setTabIndex: Dispatch<SetStateAction<number>>;
};

/**
 * A React context to provide tab state to child components.
 * This allows nested components to interact with the tab state, such as changing the active tab.
 */
export const TabContext = createContext<ContextProps | null>(null);

/**
 * A component that creates a tabbed interface.
 * It manages the active tab state and renders the corresponding tab pane.
 * It also provides a context for child components to access and modify the tab state.
 *
 * @param {TabsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tabs and the active tab pane.
 */
const Tabs = ({ tabs }: TabsProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = tabs[tabIndex];

  return (
    <TabContext.Provider
      value={{
        tabIndex,
        setTabIndex,
      }}
    >
      <TabContainer>
        {tabs?.map((tab, i) => (
          <Tab key={i} onClick={() => setTabIndex(i)}>
            {tab.label}
          </Tab>
        ))}
      </TabContainer>
      <TabPane content={activeTab.content} />
    </TabContext.Provider>
  );
};

export default Tabs;
