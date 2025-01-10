import { Editor } from "@monaco-editor/react";

import { Dispatch, SetStateAction } from "react";
import { useConfigContext } from "../context/ConfigContext";
import { Injection } from "../atoms/InjectionRow"

type EditorOptions = {
  readOnly?: boolean,
}

type Props = {
  className?: string,
  options?: EditorOptions,
  injection: Injection,
  setInjection: Dispatch<SetStateAction<Injection>>
};

const InjectionEditor = ({ className, options, injection, setInjection }: Props) => {
  const configContext = useConfigContext();
  const handleChange = async (textInput: string | undefined) => {
    if (!textInput) return null;
    let newInjection = { ...injection, content: textInput };
    setInjection(newInjection);
  }

  if (!configContext) return null;

  return (
    <div className={className}>
      <Editor
        height="80vh"
        defaultLanguage="javascript"
        language="javascript"
        onChange={handleChange}
        value={injection.content}
        theme={"vs-dark"}
        options={options || null}
      />
    </div>
  );
}

export default InjectionEditor;