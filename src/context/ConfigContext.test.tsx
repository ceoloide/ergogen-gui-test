import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ConfigContextProvider, { ConfigContext } from './ConfigContext';

const mockConfig = 'points: {}';

describe('ConfigContextProvider', () => {
  it('should fetch config from github url parameter and update the config', async () => {
    const fetchSpy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(mockConfig, { status: 200 }))
    );

    // Set the URL for the test
    window.history.pushState({}, 'Test page', '/?github=https://github.com/ceoloide/corney-island/blob/main/ergogen/config.yaml');

    let configValue: string | undefined;

    render(
      <ConfigContextProvider initialInput="">
        <ConfigContext.Consumer>
          {(value) => {
            if (value) {
              configValue = value.configInput;
            }
            return null;
          }}
        </ConfigContext.Consumer>
      </ConfigContextProvider>
    );

    await waitFor(() => {
      expect(configValue).toBe(mockConfig);
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

    let configValue: string | undefined;

    render(
      <ConfigContextProvider initialInput="">
        <ConfigContext.Consumer>
          {(value) => {
            if (value) {
              configValue = value.configInput;
            }
            return null;
          }}
        </ConfigContext.Consumer>
      </ConfigContextProvider>
    );

    await waitFor(() => {
      expect(configValue).toBe(mockConfig);
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://raw.githubusercontent.com/ceoloide/corney-island/main/ergogen/config.yaml');

    fetchSpy.mockRestore();
  });
});
