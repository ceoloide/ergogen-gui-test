import {Editor} from "@monaco-editor/react";

import React, {useEffect} from "react";
import {useConfigContext} from "../context/ConfigContext";

type EditorOptions = {
  readOnly?: boolean,
}

type Props = {
  className?: string,
  options?: EditorOptions,
};

const ConfigEditor = ({className, options}: Props) => {
    const configContext = useConfigContext();

    // @ts-ignore
    const {configInput, setConfigInput} = configContext;

    const handleChange = async (textInput: string | undefined) => {
        if(!textInput) return null;

        setConfigInput(textInput);
    }

    useEffect(() => {
        handleChange(configInput);
    });

    return (
        <div className={className}>
            <Editor
                height="85vh"
                defaultLanguage="yaml"
                language="yaml"
                onChange={handleChange}
                value={configInput}
                theme={"vs-dark"}
                defaultValue={configInput}
                options={options || null}
            />
        </div>
    );
}

export default ConfigEditor;