import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import Ergogen from './Ergogen';
import Welcome from './pages/Welcome';
import Header from './atoms/Header';
import ConfigContextProvider, { CONFIG_LOCAL_STORAGE_KEY } from './context/ConfigContext';

const App = () => {
  // Synchronously get the initial value to avoid race conditions on first render.
  const storedConfigValue = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
  const initialConfig = storedConfigValue ? JSON.parse(storedConfigValue) : '';

  // The useLocalStorage hook now manages the config state in the App component.
  const [configInput, setConfigInput] = useLocalStorage<string>(
    CONFIG_LOCAL_STORAGE_KEY,
    initialConfig
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // When a config is selected on the welcome page, the configInput state will be updated.
    // This effect will then trigger the navigation to the main app.
    if (configInput && location.pathname === '/new') {
      navigate('/');
    }
  }, [configInput, location.pathname, navigate]);

  return (
    // Pass the state and the setter function down to the context provider.
    <ConfigContextProvider
      configInput={configInput}
      setConfigInput={setConfigInput}
      initialInjectionInput={[]}
    >
      <Header />
      <Routes>
        <Route
          path="/"
          // The routing decision is now based on the reactive `configInput` state.
          element={configInput ? <Ergogen /> : <Navigate to="/new" replace />}
        />
        <Route
          path="/new"
          element={<Welcome />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigContextProvider>
  );
};

export default App;