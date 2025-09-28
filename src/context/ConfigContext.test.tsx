import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ConfigContextProvider from './ConfigContext';

const mockConfig = 'points: {}';

describe('ConfigContextProvider', () => {
  it('should fetch config from github url parameter and update the config', async () => {
    const fetchSpy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(mockConfig, { status: 200 }))
    );

    // Set the URL for the test
    window.history.pushState({}, 'Test page', '/?github=https://github.com/ceoloide/corney-island/blob/main/ergogen/config.yaml');

    const setConfigInputMock = jest.fn();

    render(
      <ConfigContextProvider configInput="" setConfigInput={setConfigInputMock}>
        <div></div>
      </ConfigContextProvider>
    );

    await waitFor(() => {
      expect(setConfigInputMock).toHaveBeenCalledWith(mockConfig);
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://raw.githubusercontent.com/ceoloide/corney-island/main/ergogen/config.yaml');

    fetchSpy.mockRestore();
  });

  it('should fetch config from github url parameter without protocol and update the config', async () => {
    const fetchSpy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(mockConfig, { status: 200 }))
    );

    // Set the URL for the test
    window.history.pushState({}, 'Test page', '/?github=github.com/ceoloide/corney-island/blob/main/ergogen/config.yaml');

    const setConfigInputMock = jest.fn();

    render(
      <ConfigContextProvider configInput="" setConfigInput={setConfigInputMock}>
          <div></div>
      </ConfigContextProvider>
    );

    await waitFor(() => {
      expect(setConfigInputMock).toHaveBeenCalledWith(mockConfig);
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://raw.githubusercontent.com/ceoloide/corney-island/main/ergogen/config.yaml');

    fetchSpy.mockRestore();
  });
});