import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import styled from 'styled-components';

import Ergogen from './Ergogen';
import Welcome from './pages/Welcome';
import Header from './atoms/Header';
import ConfigContextProvider, { CONFIG_LOCAL_STORAGE_KEY, useConfigContext } from './context/ConfigContext';
import Banners from './organisms/Banners';

const PageWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const AppContent = () => {
  const location = useLocation();
  const configContext = useConfigContext();

  // Destructure the clear functions and showSettings from the context.
  const { showSettings, clearError, clearWarning } = configContext || {};

  useEffect(() => {
    // This effect now correctly depends on location, showSettings, and the stable
    // clear functions, centralizing the clearing logic.
    clearError?.();
    clearWarning?.();
  }, [location, showSettings, clearError, clearWarning]);

  if (!configContext) return null;

  const { configInput } = configContext;

  return (
    <>
      <Header />
      <Banners />
      <PageWrapper>
        <Routes>
          <Route
            path="/"
            element={configInput ? <Ergogen /> : <Navigate to="/new" replace />}
          />
          <Route path="/new" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageWrapper>
    </>
  );
};

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
      <AppContent />
    </ConfigContextProvider>
  );
};

export default App;