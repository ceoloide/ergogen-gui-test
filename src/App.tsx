import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import Ergogen from './Ergogen';
import Welcome from './pages/Welcome';
import Header from './atoms/Header';
import ConfigContextProvider, { CONFIG_LOCAL_STORAGE_KEY } from './context/ConfigContext';

// A layout for the main application, including the header.
const MainAppLayout = () => {
  return (
    <>
      <Header />
      <Ergogen />
    </>
  )
}

const App = () => {
  const [storedConfig] = useLocalStorage<string>(CONFIG_LOCAL_STORAGE_KEY);

  // The router's behavior depends on `storedConfig`, which is read once per render.
  // To prevent race conditions where the context writes a default value to storage
  // before the navigation can happen, we ensure the context is initialized with either
  // the existing config or an empty string, which is falsy and won't break the routing logic.
  const initialConfig = storedConfig || '';

  return (
    <ConfigContextProvider initialInput={initialConfig} initialInjectionInput={[]}>
      <Routes>
        <Route
          path="/"
          element={storedConfig ? <MainAppLayout /> : <Navigate to="/new" replace />}
        />
        <Route
          path="/new"
          element={storedConfig ? <Navigate to="/" replace /> : <Welcome />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigContextProvider>
  );
};

export default App;