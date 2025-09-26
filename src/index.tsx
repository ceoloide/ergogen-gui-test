import React from 'react';
import { createRoot } from 'react-dom/client';
import styled from "styled-components";
import './index.css';

import Ergogen from './Ergogen';
import Header from "./atoms/Header";
import ConfigContextProvider from "./context/ConfigContext";
import Absolem from "./examples/absolem";

/**
 * The main container for the entire application.
 * It sets up the basic flex layout, text color, and font for the app.
 */
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  height: 100%;
  width: 100%;
  font-family: 'Roboto', sans-serif;
`;

// This is the main entry point for the React application.
// It sets up the root container and renders the main App component,
// wrapping it with the necessary context providers.
// The application is initialized with a default example configuration (Absolem).
const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <>
      <AppContainer>
        <ConfigContextProvider initialInput={Absolem.value} initialInjectionInput={[]}>
          <Header />
          <Ergogen />
        </ConfigContextProvider>
      </AppContainer>
    </>
  </React.StrictMode>
);