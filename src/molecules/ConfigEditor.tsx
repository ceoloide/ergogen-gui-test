import {Editor, OnMount} from "@monaco-editor/react";
import React, {useEffect} from "react";
import {useConfigContext} from "../context/ConfigContext";

/**
 * Defines the options for the Monaco Editor instance.
 * @typedef {object} EditorOptions
 * @property {boolean} [readOnly] - If true, the editor will be in read-only mode.
 */
type EditorOptions = {
  readOnly?: boolean,
}

/**
 * Props for the ConfigEditor component.
 * @typedef {object} Props
 * @property {string} [className] - An optional CSS class name for the component's container.
 * @property {EditorOptions} [options] - Optional settings for the Monaco Editor.
 * @property {string} [data-testid] - An optional data-testid attribute for testing purposes.
 */
type Props = {
  className?: string,
  options?: EditorOptions,
  "data-testid"?: string
};

/**
 * A component that provides a YAML editor for configuring Ergogen settings.
 * It uses the Monaco Editor for a rich editing experience and integrates with the ConfigContext
 * to manage the configuration state.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} A container with the Monaco Editor instance.
 */
const ConfigEditor = ({className, options, "data-testid": dataTestId}: Props) => {
    const configContext = useConfigContext();

    // @ts-ignore
    const {configInput, setConfigInput, injectionInput, generateNow} = configContext;

    /**
     * Handles changes in the editor's content.
     * Updates the global configuration state if the input is valid.
     * @param {string | undefined} textInput - The new text content from the editor.
     */
    const handleChange = async (textInput: string | undefined) => {
        if(!textInput) return null;

        setConfigInput(textInput);
    }

    useEffect(() => {
        handleChange(configInput);
    }, [configInput, handleChange]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editor.addAction({
            id: 'generate-config',
            label: 'Generate',
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],
            run: (editor: any) => {
                const currentConfig = editor.getValue();
                // Also update the context state so the UI is in sync
                setConfigInput(currentConfig);
                generateNow(currentConfig, injectionInput, {pointsonly: false});
            }
        })
    }

    return (
        <div className={className} data-testid={dataTestId}>
            <Editor
                height="100%"
                defaultLanguage="yaml"
                language="yaml"
                onChange={handleChange}
                onMount={handleEditorDidMount}
                value={configInput}
                theme={"vs-dark"}
                defaultValue={configInput}
                options={options || undefined}
            />
        </div>
    );
}

export default ConfigEditor;