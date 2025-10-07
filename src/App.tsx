import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import styled from 'styled-components';

import Ergogen from './Ergogen';
import Welcome from './pages/Welcome';
import Header from './atoms/Header';
import LoadingBar from './atoms/LoadingBar';
import Banners from './organisms/Banners';
import ConfigContextProvider, {
  CONFIG_LOCAL_STORAGE_KEY,
  useConfigContext,
} from './context/ConfigContext';

const App = () => {
  // Synchronously get the initial value to avoid race conditions on first render.
  const storedConfigValue = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
  const initialConfig = storedConfigValue ? JSON.parse(storedConfigValue) : '';

  // The useLocalStorage hook now manages the config state in the App component.
  // This ensures that any component that updates the config will trigger a re-render here,
  // which in turn makes the routing logic reactive.
  const [configInput, setConfigInput] = useLocalStorage<string>(
    CONFIG_LOCAL_STORAGE_KEY,
    initialConfig
  );

  return (
    // Pass the state and the setter function down to the context provider.
    <ConfigContextProvider
      configInput={configInput}
      setConfigInput={setConfigInput}
      initialInjectionInput={[]}
    >
      <AppContent configInput={configInput} />
    </ConfigContextProvider>
  );
};

/**
 * Inner component that has access to the config context.
 */
const AppContent = ({ configInput }: { configInput: string | undefined }) => {
  const configContext = useConfigContext();

  return (
    <>
      <Header />
      <LoadingBar
        visible={configContext?.isGenerating ?? false}
        data-testid="loading-bar"
      />
      <Banners />
      <PageWrapper>
        <Routes>
          <Route
            path="/"
            // The routing decision is now based on the reactive `configInput` state.
            element={configInput ? <Ergogen /> : <Navigate to="/new" replace />}
          />
          <Route path="/new" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageWrapper>
    </>
  );
};

const PageWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export default App;
