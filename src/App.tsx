import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Ergogen from './Ergogen';
import Welcome from './pages/Welcome';
import Header from './atoms/Header';
import ConfigContextProvider, { CONFIG_LOCAL_STORAGE_KEY } from './context/ConfigContext';

const MainAppLayout = () => (
  <>
    <Header />
    <Ergogen />
  </>
);

const App = () => {
  // Read directly from localStorage for the initial routing decision to avoid race conditions.
  // The useLocalStorage hook in the context can cause a delay, leading to incorrect initial routing.
  const storedConfigValue = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);

  // If a stored config exists, use it as the initial input for the context.
  // Otherwise, start with an empty string.
  const initialConfig = storedConfigValue ? JSON.parse(storedConfigValue) : '';

  return (
    <ConfigContextProvider initialInput={initialConfig} initialInjectionInput={[]}>
      <Routes>
        <Route
          path="/"
          // The routing decision is now based on the synchronous read from local storage.
          element={storedConfigValue ? <MainAppLayout /> : <Navigate to="/new" replace />}
        />
        <Route
          path="/new"
          element={<Welcome />}
        />
        {/* Redirect any unknown paths to the root, which will then handle the routing logic. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigContextProvider>
  );
};

export default App;