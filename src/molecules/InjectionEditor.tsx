import { Editor } from "@monaco-editor/react";
import { Dispatch, SetStateAction } from "react";
import { useConfigContext } from "../context/ConfigContext";
import { Injection } from "../atoms/InjectionRow";

/**
 * Defines the options for the Monaco Editor instance.
 * @typedef {object} EditorOptions
 * @property {boolean} [readOnly] - If true, the editor will be in read-only mode.
 */
type EditorOptions = {
  readOnly?: boolean,
};

/**
 * Props for the InjectionEditor component.
 * @typedef {object} Props
 * @property {string} [className] - An optional CSS class name for the component's container.
 * @property {EditorOptions} [options] - Optional settings for the Monaco Editor.
 * @property {Injection} injection - The injection object to be edited.
 * @property {Dispatch<SetStateAction<Injection>>} setInjection - Function to update the injection state.
 */
type Props = {
  className?: string,
  options?: EditorOptions,
  injection: Injection,
  setInjection: Dispatch<SetStateAction<Injection>>
};

/**
 * A component that provides a JavaScript editor for editing code injections.
 * It uses the Monaco Editor and updates the injection state on content change.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element | null} A container with the Monaco Editor or null if the context is missing.
 */
const InjectionEditor = ({ className, options, injection, setInjection }: Props) => {
  const configContext = useConfigContext();

  /**
   * Handles changes in the editor's content.
   * Updates the parent component's injection state with the new content.
   * @param {string | undefined} textInput - The new text content from the editor.
   */
  const handleChange = async (textInput: string | undefined) => {
    if (!textInput) return null;
    const newInjection = { ...injection, content: textInput };
    setInjection(newInjection);
  };

  if (!configContext) return null;

  return (
    <div className={className}>
      <Editor
        height="60vh"
        defaultLanguage="javascript"
        language="javascript"
        onChange={handleChange}
        value={injection.content}
        theme={"ergogen-theme"}
        options={options || undefined}
      />
    </div>
  );
};

export default InjectionEditor;