import React, { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { DebouncedFunc } from "lodash-es";
import yaml from "js-yaml";
import debounce from "lodash.debounce";
import { useLocalStorage } from 'react-use';
import { fetchConfigFromUrl } from '../utils/github';

/**
 * Props for the ConfigContextProvider component.
 */
type Props = {
  configInput: string | undefined;
  setConfigInput: Dispatch<SetStateAction<string | undefined>>;
  initialInjectionInput?: string[][];
  children: React.ReactNode[] | React.ReactNode;
};

/**
 * Represents the structure of the Ergogen processing results.
 */
type Results = { [key: string]: any | Results };

/**
 * Defines the shape of the data and functions provided by the ConfigContext.
 */
type ContextProps = {
  configInput: string | undefined,
  setConfigInput: Dispatch<SetStateAction<string | undefined>>,
  injectionInput: string[][] | undefined,
  setInjectionInput: Dispatch<SetStateAction<string[][] | undefined>>,
  processInput: DebouncedFunc<(textInput: string | undefined, injectionInput: string[][] | undefined, options?: ProcessOptions) => Promise<void>>,
  generateNow: (textInput: string | undefined, injectionInput: string[][] | undefined, options?: ProcessOptions) => Promise<void>,
  error: string | null,
  setError: Dispatch<SetStateAction<string | null>>,
  clearError: () => void,
  deprecationWarning: string | null,
  clearWarning: () => void,
  results: Results | null,
  resultsVersion: number,
  setResultsVersion: Dispatch<SetStateAction<number>>,
  showSettings: boolean,
  setShowSettings: Dispatch<SetStateAction<boolean>>,
  showConfig: boolean,
  setShowConfig: Dispatch<SetStateAction<boolean>>,
  showDownloads: boolean,
  setShowDownloads: Dispatch<SetStateAction<boolean>>,
  debug: boolean,
  setDebug: Dispatch<SetStateAction<boolean>>,
  autoGen: boolean,
  setAutoGen: Dispatch<SetStateAction<boolean>>,
  autoGen3D: boolean,
  setAutoGen3D: Dispatch<SetStateAction<boolean>>,
  kicanvasPreview: boolean,
  setKicanvasPreview: Dispatch<SetStateAction<boolean>>,
  jscadPreview: boolean,
  setJscadPreview: Dispatch<SetStateAction<boolean>>,
  experiment: string | null
};

/**
 * Options for the `processInput` function.
 */
type ProcessOptions = {
  pointsonly: boolean
};

export const ConfigContext = createContext<ContextProps | null>(null);

export const CONFIG_LOCAL_STORAGE_KEY = 'LOCAL_STORAGE_CONFIG'

const localStorageOrDefault = (key: string, defaultValue: any) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    return JSON.parse(storedValue);
  } else {
    return defaultValue;
  }
}

/**
 * The provider component for the ConfigContext.
 * It manages all state related to configuration, injections, settings, and results.
 */
const ConfigContextProvider = ({ configInput, setConfigInput, initialInjectionInput, children }: Props) => {
  const [injectionInput, setInjectionInput] = useLocalStorage<string[][]>("ergogen:injection", initialInjectionInput);
  const [error, setError] = useState<string | null>(null);
  const [deprecationWarning, setDeprecationWarning] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [resultsVersion, setResultsVersion] = useState<number>(0);
  const [debug, setDebug] = useState<boolean>(localStorageOrDefault("ergogen:config:debug", false));
  const [autoGen, setAutoGen] = useState<boolean>(localStorageOrDefault("ergogen:config:autoGen", true));
  const [autoGen3D, setAutoGen3D] = useState<boolean>(localStorageOrDefault("ergogen:config:autoGen3D", true));
  const [kicanvasPreview, setKicanvasPreview] = useState<boolean>(localStorageOrDefault("ergogen:config:kicanvasPreview", true));
  const [jscadPreview, setJscadPreview] = useState<boolean>(localStorageOrDefault("ergogen:config:jscadPreview", false));
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [showDownloads, setShowDownloads] = useState<boolean>(true);

  const clearError = useCallback(() => setError(null), []);
  const clearWarning = useCallback(() => setDeprecationWarning(null), []);
  
  /**
   * Effect to save user settings to local storage whenever they change.
   */
  useEffect(() => {
    localStorage.setItem('ergogen:config:debug', JSON.stringify(debug));
    localStorage.setItem('ergogen:config:autoGen', JSON.stringify(autoGen));
    localStorage.setItem('ergogen:config:autoGen3D', JSON.stringify(autoGen3D));
    localStorage.setItem('ergogen:config:kicanvasPreview', JSON.stringify(kicanvasPreview));
    localStorage.setItem('ergogen:config:jscadPreview', JSON.stringify(jscadPreview));
  }, [debug, autoGen, autoGen3D, kicanvasPreview, jscadPreview]);

  /**
   * Parses a string as either JSON or YAML.
   */
  const parseConfig = (inputString: string): [string, { [key: string]: any[] } | null] => {
    let type = 'UNKNOWN';
    let parsedConfig = null;
    try {
      parsedConfig = JSON.parse(inputString);
      type = 'json';
    } catch (e: unknown) {}
    try {
      parsedConfig = yaml.load(inputString);
      type = 'yaml';
    } catch (e: unknown) {}
    return [type, parsedConfig]
  };

  /**
   * The core function that runs the Ergogen generation process.
   */
  const runGeneration = useCallback(async (textInput: string | undefined, injectionInput: string[][] | undefined, options: ProcessOptions = { pointsonly: true }) => {
    let results = null;
    let inputConfig: string | {} = textInput ?? '';
    let inputInjection: [][] | {} = injectionInput ?? '';
    const [, parsedConfig] = parseConfig(textInput ?? '');

    setError(null);
    setDeprecationWarning(null);

    if (parsedConfig && parsedConfig.pcbs) {
      const pcbs = Object.values(parsedConfig.pcbs) as any[];
      let warningFound = false;
      for (const pcb of pcbs) {
        if (!pcb.template || pcb.template === 'kicad5') {
          if (pcb.footprints) {
            const footprints = Object.values(pcb.footprints) as any[];
            for (const footprint of footprints) {
              if (footprint && typeof footprint.what === 'string' && footprint.what.startsWith('ceoloide')) {
                setDeprecationWarning(
                  'KiCad 5 is deprecated. Please add "template: kicad8" to your PCB definitions to avoid errors when opening PCB files with KiCad 8 or newer.'
                );
                warningFound = true;
                break;
              }
            }
          }
        }
        if (warningFound) {
          break;
        }
      }
    }

    if (parsedConfig?.points && options?.pointsonly) {
      inputConfig = {
        ...parsedConfig,
        ['pcbs']: undefined,
        ['cases']: undefined,
      };
    }

    try {
      if (inputInjection !== undefined && Array.isArray(inputInjection)) {
        for (let i = 0; i < inputInjection.length; i++) {
          let injection = inputInjection[i];
          if (Array.isArray(injection) && injection.length === 3) {
            const inj_type = injection[0];
            const inj_name = injection[1];
            const inj_text = injection[2];
            const module_prefix = 'const module = {};\n\n'
            const module_suffix = '\n\nreturn module.exports;'
            const inj_value = new Function("require", module_prefix + inj_text + module_suffix)();
            (window as any).ergogen.inject(inj_type, inj_name, inj_value);
          }
        }
      }
      results = await (window as any).ergogen.process(
        inputConfig,
        true,
        (m: string) => console.log(m)
      );
    } catch (e: unknown) {
      if (!e) return;
      if (typeof e === "string") {
        setError(e);
      }
      if (typeof e === "object") {
        setError((e as Error).toString());
      }
      return;
    }

    setResults(results);
    setResultsVersion(v => v + 1)
  }, []);

  /**
   * A debounced version of runGeneration for auto-generation.
   */
  const processInput = useCallback(debounce(runGeneration, 300), [runGeneration]);

  /**
   * An immediate version for the "Generate" button that cancels any pending auto-generations.
   */
  const generateNow = useCallback(async (textInput: string | undefined, injectionInput: string[][] | undefined, options: ProcessOptions = { pointsonly: true }) => {
    processInput.cancel();
    await runGeneration(textInput, injectionInput, options);
  }, [processInput, runGeneration]);

  /**
   * Effect for auto-generation.
   */
  useEffect(() => {
    localStorage.setItem('ergogen:injection', JSON.stringify(injectionInput));
    if (autoGen) {
      processInput(configInput, injectionInput, { pointsonly: !autoGen3D });
    }
  }, [processInput, configInput, injectionInput, autoGen, autoGen3D]);

  const queryParameters = new URLSearchParams(window.location.search);
  const experiment = queryParameters.get("exp");

  /**
   * Effect to fetch config from URL on mount.
   */
  useEffect(() => {
    const githubUrl = queryParameters.get("github");
    if (githubUrl) {
      fetchConfigFromUrl(githubUrl)
        .then((data) => {
          setConfigInput(data);
        })
        .catch((e) => {
          setError(`Failed to fetch config from GitHub: ${e.message}`);
        });
    }
  }, [setConfigInput]);

  const contextValue = useMemo(() => ({
    configInput,
    setConfigInput,
    injectionInput,
    setInjectionInput,
    processInput,
    generateNow,
    error,
    setError,
    clearError,
    deprecationWarning,
    clearWarning,
    results,
    resultsVersion,
    setResultsVersion,
    showSettings,
    setShowSettings,
    showConfig,
    setShowConfig,
    showDownloads,
    setShowDownloads,
    debug,
    setDebug,
    autoGen,
    setAutoGen,
    autoGen3D,
    setAutoGen3D,
    kicanvasPreview,
    setKicanvasPreview,
    jscadPreview,
    setJscadPreview,
    experiment,
  }), [
    configInput,
    setConfigInput,
    injectionInput,
    setInjectionInput,
    processInput,
    generateNow,
    error,
    setError,
    clearError,
    deprecationWarning,
    clearWarning,
    results,
    resultsVersion,
    setResultsVersion,
    showSettings,
    setShowSettings,
    showConfig,
    setShowConfig,
    showDownloads,
    setShowDownloads,
    debug,
    setDebug,
    autoGen,
    setAutoGen,
    autoGen3D,
    setAutoGen3D,
    kicanvasPreview,
    setKicanvasPreview,
    jscadPreview,
    setJscadPreview,
    experiment,
  ]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContextProvider;

/**
 * A custom hook to easily consume the ConfigContext.
 */
export const useConfigContext = () => useContext(ConfigContext);