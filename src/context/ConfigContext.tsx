import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { DebouncedFunc } from 'lodash-es';
import yaml from 'js-yaml';
import debounce from 'lodash.debounce';
import { useLocalStorage } from 'react-use';
import { fetchConfigFromUrl } from '../utils/github';
import { convertJscadToStl } from '../utils/jscad';
import { WorkerRequest, WorkerResponse } from '../workers/ergogen.worker.types';
import { createErgogenWorker } from '../workers/workerFactory';

// Strongly-typed shape for Ergogen results used in the UI
type DemoOutput = {
  dxf?: string;
  svg?: string;
};
type OutlineOutput = {
  dxf?: string;
  svg?: string;
};
type CaseOutput = {
  jscad?: string;
  stl?: string;
};
type PcbsOutput = Record<string, string>;

// Backward-compatible results type with known top-level keys and an index signature
type Results = {
  canonical?: unknown;
  points?: unknown;
  units?: unknown;
  demo?: DemoOutput;
  outlines?: Record<string, OutlineOutput>;
  cases?: Record<string, CaseOutput>;
  pcbs?: PcbsOutput;
  [key: string]: unknown;
};

declare global {
  interface Window {
    ergogen: {
      process: (
        config: unknown,
        debug: boolean,
        logger: (m: string) => void
      ) => unknown;
      inject: (type: string, name: string, value: unknown) => void;
    };
  }
}

/**
 * Props for the ConfigContextProvider component.
 * @typedef {object} Props
 * @property {string | undefined} configInput - The current YAML/JSON configuration string.
 * @property {Dispatch<SetStateAction<string | undefined>>} setConfigInput - Function to update the config input.
 * @property {string[][]} [initialInjectionInput] - The initial array of code injections.
 * @property {React.ReactNode[] | React.ReactNode} children - The child components to be wrapped by the provider.
 */
type Props = {
  configInput: string | undefined;
  setConfigInput: Dispatch<SetStateAction<string | undefined>>;
  initialInjectionInput?: string[][];
  children: React.ReactNode[] | React.ReactNode;
};

/**
 * Defines the shape of the data and functions provided by the ConfigContext.
 * @typedef {object} ContextProps
 * @property {string | undefined} configInput - The current YAML/JSON configuration string.
 * @property {Dispatch<SetStateAction<string | undefined>>} setConfigInput - Function to update the config input.
 * @property {string[][] | undefined} injectionInput - The current array of code injections.
 * @property {Dispatch<SetStateAction<string[][] | undefined>>} setInjectionInput - Function to update the injections.
 * @property {DebouncedFunc<...>} processInput - Debounced function to process the configuration.
 * @property {(textInput: string | undefined, injectionInput: string[][] | undefined, options?: ProcessOptions) => Promise<void>} generateNow - Immediate function to process the configuration.
 * @property {string | null} error - Any error message from the Ergogen process.
 * @property {Dispatch<SetStateAction<string | null>>} setError - Function to set an error message.
 * @property {() => void} clearError - Function to clear the current error message.
 * @property {string | null} deprecationWarning - Any deprecation warnings from the process.
 * @property {() => void} clearWarning - Function to clear the current deprecation warning.
 * @property {Results | null} results - The results from the Ergogen process.
 * @property {number} resultsVersion - A version number that increments with each new result.
 * @property {Dispatch<SetStateAction<number>>} setResultsVersion - Function to update the results version.
 * @property {boolean} showSettings - Flag to control the visibility of the settings panel.
 * @property {Dispatch<SetStateAction<boolean>>} setShowSettings - Function to toggle the settings panel.
 * @property {boolean} showConfig - Flag to control the visibility of the configuration editor.
 * @property {Dispatch<SetStateAction<boolean>>} setShowConfig - Function to toggle the config editor.
 * @property {boolean} showDownloads - Flag to control the visibility of the downloads panel.
 * @property {Dispatch<SetStateAction<boolean>>} setShowDownloads - Function to toggle the downloads panel.
 * @property {boolean} debug - Flag to enable debug mode.
 * @property {Dispatch<SetStateAction<boolean>>} setDebug - Function to set debug mode.
 * @property {boolean} autoGen - Flag to enable automatic regeneration of previews.
 * @property {Dispatch<SetStateAction<boolean>>} setAutoGen - Function to toggle auto-generation.
 * @property {boolean} autoGen3D - Flag to enable automatic regeneration of 3D previews.
 * @property {Dispatch<SetStateAction<boolean>>} setAutoGen3D - Function to toggle 3D auto-generation.
 * @property {boolean} kicanvasPreview - Flag to enable the KiCanvas preview for PCBs.
 * @property {Dispatch<SetStateAction<boolean>>} setKicanvasPreview - Function to toggle the KiCanvas preview.
 * @property {boolean} stlPreview - Flag to enable the STL 3D preview and conversion.
 * @property {Dispatch<SetStateAction<boolean>>} setStlPreview - Function to toggle the STL preview.
 * @property {string | null} experiment - The value of any 'exp' query parameter.
 * @property {boolean} isGenerating - Flag indicating if Ergogen generation is currently in progress.
 */
type ContextProps = {
  configInput: string | undefined;
  setConfigInput: Dispatch<SetStateAction<string | undefined>>;
  injectionInput: string[][] | undefined;
  setInjectionInput: Dispatch<SetStateAction<string[][] | undefined>>;
  processInput: DebouncedFunc<
    (
      textInput: string | undefined,
      injectionInput: string[][] | undefined,
      options?: ProcessOptions
    ) => Promise<void>
  >;
  generateNow: (
    textInput: string | undefined,
    injectionInput: string[][] | undefined,
    options?: ProcessOptions
  ) => Promise<void>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  clearError: () => void;
  deprecationWarning: string | null;
  clearWarning: () => void;
  results: Results | null;
  resultsVersion: number;
  setResultsVersion: Dispatch<SetStateAction<number>>;
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  showConfig: boolean;
  setShowConfig: Dispatch<SetStateAction<boolean>>;
  showDownloads: boolean;
  setShowDownloads: Dispatch<SetStateAction<boolean>>;
  debug: boolean;
  setDebug: Dispatch<SetStateAction<boolean>>;
  autoGen: boolean;
  setAutoGen: Dispatch<SetStateAction<boolean>>;
  autoGen3D: boolean;
  setAutoGen3D: Dispatch<SetStateAction<boolean>>;
  kicanvasPreview: boolean;
  setKicanvasPreview: Dispatch<SetStateAction<boolean>>;
  stlPreview: boolean;
  setStlPreview: Dispatch<SetStateAction<boolean>>;
  experiment: string | null;
  isGenerating: boolean;
};

/**
 * Options for the `processInput` function.
 * @typedef {object} ProcessOptions
 * @property {boolean} pointsonly - If true, only the points will be processed, skipping PCBs and cases.
 */
type ProcessOptions = {
  pointsonly: boolean;
};

/**
 * The main React context for managing Ergogen configuration and results.
 */
const ConfigContext = createContext<ContextProps | null>(null);

/**
 * Retrieves a value from local storage, or returns a default value if not found.
 * @param {string} key - The local storage key.
 * @param {any} defaultValue - The default value to return if the key is not found.
 * @returns {any} The parsed value from local storage or the default value.
 */
const localStorageOrDefault = (key: string, defaultValue: unknown) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    return JSON.parse(storedValue);
  } else {
    return defaultValue;
  }
};

/**
 * The provider component for the ConfigContext.
 * It manages all state related to configuration, injections, settings, and results.
 * It also handles fetching initial config from URL parameters and persisting settings to local storage.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} The context provider wrapping the children.
 */
const ConfigContextProvider = ({
  configInput,
  setConfigInput,
  initialInjectionInput,
  children,
}: Props) => {
  const [injectionInput, setInjectionInput] = useLocalStorage<string[][]>(
    'ergogen:injection',
    initialInjectionInput
  );
  const [error, setError] = useState<string | null>(null);
  const [deprecationWarning, setDeprecationWarning] = useState<string | null>(
    null
  );
  const [results, setResults] = useState<Results | null>(null);
  const [resultsVersion, setResultsVersion] = useState<number>(0);
  const [debug, setDebug] = useState<boolean>(
    localStorageOrDefault('ergogen:config:debug', false)
  );
  const [autoGen, setAutoGen] = useState<boolean>(
    localStorageOrDefault('ergogen:config:autoGen', true)
  );
  const [autoGen3D, setAutoGen3D] = useState<boolean>(
    localStorageOrDefault('ergogen:config:autoGen3D', true)
  );
  const [kicanvasPreview, setKicanvasPreview] = useState<boolean>(
    localStorageOrDefault('ergogen:config:kicanvasPreview', true)
  );
  const [stlPreview, setStlPreview] = useState<boolean>(
    localStorageOrDefault('ergogen:config:stlPreview', false)
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [showDownloads, setShowDownloads] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const workerRef = useRef<Worker | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearWarning = useCallback(() => setDeprecationWarning(null), []);

  /**
   * Effect to save user settings to local storage whenever they change.
   */
  useEffect(() => {
    localStorage.setItem('ergogen:config:debug', JSON.stringify(debug));
    localStorage.setItem('ergogen:config:autoGen', JSON.stringify(autoGen));
    localStorage.setItem('ergogen:config:autoGen3D', JSON.stringify(autoGen3D));
    localStorage.setItem(
      'ergogen:config:kicanvasPreview',
      JSON.stringify(kicanvasPreview)
    );
    localStorage.setItem(
      'ergogen:config:stlPreview',
      JSON.stringify(stlPreview)
    );
  }, [debug, autoGen, autoGen3D, kicanvasPreview, stlPreview]);

  /**
   * Parses a string as either JSON or YAML.
   * @param {string} inputString - The string to parse.
   * @returns {[string, object | null]} A tuple containing the detected type ('json', 'yaml', or 'UNKNOWN') and the parsed object, or null if parsing fails.
   */
  const parseConfig = (
    inputString: string
  ): [string, { [key: string]: unknown[] } | null] => {
    let type = 'UNKNOWN';
    let parsedConfig = null;

    try {
      parsedConfig = JSON.parse(inputString);
      type = 'json';
    } catch (_e: unknown) {
      // Input is not valid JSON
    }

    try {
      parsedConfig = yaml.load(inputString);
      type = 'yaml';
    } catch (_e: unknown) {
      // Input is not valid YAML
    }

    return [type, parsedConfig];
  };

  /**
   * Helper to check for deprecation warnings.
   */
  const checkForDeprecationWarnings = useCallback(
    (parsedConfig: { [key: string]: unknown } | null): string | null => {
      if (parsedConfig && parsedConfig.pcbs) {
        const pcbs = Object.values(parsedConfig.pcbs) as Record<
          string,
          unknown
        >[];
        for (const pcb of pcbs) {
          if (!pcb.template || pcb.template === 'kicad5') {
            if (pcb.footprints) {
              const footprints = Object.values(
                pcb.footprints as Record<string, unknown>
              ) as Record<string, unknown>[];
              for (const footprint of footprints) {
                if (
                  footprint &&
                  typeof footprint.what === 'string' &&
                  footprint.what.startsWith('ceoloide')
                ) {
                  return 'KiCad 5 is deprecated. Please add "template: kicad8" to your PCB definitions to avoid errors when opening PCB files with KiCad 8 or newer.';
                }
              }
            }
          }
        }
      }
      return null;
    },
    []
  );

  /**
   * The core function that runs the Ergogen generation process using a web worker.
   */
  const runGeneration = useCallback(
    async (
      textInput: string | undefined,
      injectionInput: string[][] | undefined,
      options: ProcessOptions = { pointsonly: true }
    ) => {
      if (!textInput) {
        return;
      }

      setError(null);
      setDeprecationWarning(null);
      setIsGenerating(true);

      try {
        // Parse config and check for deprecation warnings
        const [, parsedConfig] = parseConfig(textInput);
        const warning = checkForDeprecationWarnings(parsedConfig);

        // Prepare config for generation
        let inputConfig: string | object = textInput;
        if (parsedConfig?.points && options?.pointsonly) {
          inputConfig = {
            ...parsedConfig,
            pcbs: undefined,
            cases: undefined,
          };
        }

        // Create or reuse worker
        if (!workerRef.current) {
          workerRef.current = createErgogenWorker();
        }

        // If no worker available (test environment), throw error
        if (!workerRef.current) {
          throw new Error('Worker not available in test environment');
        }

        const worker = workerRef.current;

        // Set up promise to handle worker response
        const generationPromise = new Promise<unknown>((resolve, reject) => {
          const handleMessage = (event: MessageEvent<WorkerResponse>) => {
            const response = event.data;

            if (response.type === 'success') {
              worker.removeEventListener('message', handleMessage);
              worker.removeEventListener('error', handleError);
              resolve(response.results);
            } else if (response.type === 'error') {
              worker.removeEventListener('message', handleMessage);
              worker.removeEventListener('error', handleError);
              reject(new Error(response.error));
            } else if (response.type === 'warning') {
              setDeprecationWarning(response.warning);
            }
          };

          const handleError = (error: ErrorEvent) => {
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleError);
            reject(
              new Error(
                `Worker error: ${error.message || 'Unknown worker error'}`
              )
            );
          };

          worker.addEventListener('message', handleMessage);
          worker.addEventListener('error', handleError as EventListener);
        });

        // Post message to worker
        const request: WorkerRequest = {
          type: 'generate',
          inputConfig,
          injectionInput,
          deprecationWarning: warning,
        };
        worker.postMessage(request);

        // Wait for results
        const results = (await generationPromise) as Results;

        // Set initial results immediately with pending STL placeholders
        if (results && results.cases) {
          const casesWithStl: Record<string, CaseOutput> = {};
          for (const [name, caseObj] of Object.entries(
            results.cases as Record<string, CaseOutput>
          )) {
            casesWithStl[name] = {
              ...caseObj,
              stl: undefined, // Mark as pending
            };
          }
          results.cases = casesWithStl;
        }

        // Set results immediately so UI shows pending STL files
        setResults(results);
        setResultsVersion((v) => v + 1);

        // Convert JSCAD cases to STL format asynchronously only if stlPreview is enabled
        if (stlPreview && results && results.cases) {
          const casesList = Object.entries(
            results.cases as Record<string, CaseOutput>
          );

          // Convert each JSCAD to STL asynchronously
          for (const [caseName, caseObj] of casesList) {
            if (caseObj.jscad) {
              // Capture caseName in an IIFE to ensure proper closure
              ((name) => {
                convertJscadToStl(caseObj.jscad!).then((stl) => {
                  // Update results with the new STL for this specific case
                  setResults((prevResults) => {
                    if (!prevResults?.cases) return prevResults;

                    return {
                      ...prevResults,
                      cases: {
                        ...prevResults.cases,
                        [name]: {
                          ...prevResults.cases[name],
                          stl: stl ?? undefined,
                        },
                      },
                    };
                  });

                  // Increment version to trigger re-render
                  setResultsVersion((v) => v + 1);
                });
              })(caseName);
            }
          }
        }
      } catch (e: unknown) {
        if (!e) return;

        if (typeof e === 'string') {
          setError(e);
        } else if (e instanceof Error) {
          setError(e.message);
        } else if (typeof e === 'object' && e !== null) {
          setError(e.toString());
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [stlPreview, checkForDeprecationWarnings]
  );

  /**
   * A debounced version of runGeneration for auto-generation.
   */
  const processInput = useCallback(debounce(runGeneration, 300), [
    runGeneration,
  ]);

  /**
   * An immediate version for the "Generate" button that cancels any pending auto-generations.
   */
  const generateNow = useCallback(
    async (
      textInput: string | undefined,
      injectionInput: string[][] | undefined,
      options: ProcessOptions = { pointsonly: true }
    ) => {
      processInput.cancel();
      await runGeneration(textInput, injectionInput, options);
    },
    [processInput, runGeneration]
  );

  /**
   * Effect to process the input configuration on the initial load.
   */
  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const githubUrl = queryParameters.get('github');
    if (githubUrl) {
      fetchConfigFromUrl(githubUrl)
        .then((data) => {
          setConfigInput(data);
          generateNow(data, injectionInput, { pointsonly: false });
        })
        .catch((e) => {
          setError(`Failed to fetch config from GitHub: ${e.message}`);
        });
    } else if (configInput) {
      generateNow(configInput, injectionInput, { pointsonly: false });
    }
  }, []);

  /**
   * Effect to process the input configuration whenever it or the auto-generation settings change.
   * Also persists the injection input to local storage.
   */
  useEffect(() => {
    localStorage.setItem('ergogen:injection', JSON.stringify(injectionInput));
    if (autoGen) {
      processInput(configInput, injectionInput, { pointsonly: !autoGen3D });
    }
  }, [configInput, injectionInput, autoGen, autoGen3D, processInput]);

  const experiment = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('exp');
  }, []);

  /**
   * Effect to clean up the web worker on unmount.
   */
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
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
      stlPreview,
      setStlPreview,
      experiment,
      isGenerating,
    }),
    [
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
      stlPreview,
      setStlPreview,
      experiment,
      isGenerating,
    ]
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContextProvider;

/**
 * A custom hook to easily consume the ConfigContext.
 * @returns {ContextProps | null} The context value, or null if used outside a provider.
 */
export const useConfigContext = () => useContext(ConfigContext);

// Re-export constants for backward compatibility
export { CONFIG_LOCAL_STORAGE_KEY } from './constants';
