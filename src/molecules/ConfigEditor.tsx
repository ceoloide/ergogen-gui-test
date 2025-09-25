import {Editor} from "@monaco-editor/react";

import React, {useEffect} from "react";
import {useConfigContext} from "../context/ConfigContext";

type EditorOptions = {
  readOnly?: boolean,
}

type Props = {
  className?: string,
  options?: EditorOptions,
  "data-testid"?: string
};

const ConfigEditor = ({className, options, "data-testid": dataTestId}: Props) => {
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
        <div className={className} data-testid={dataTestId}>
            <Editor
                height="100%"
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