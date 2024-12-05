import IEditorOptions from "@monaco-editor/react";
import Editor from "@monaco-editor/react";

type Props = {
  content: string,
  language?: string,
  className?: string,
  options?: typeof IEditorOptions,
};

const TextPreview = ({content, language, className, options}: Props) => {
    return (
        <div className={className}>
            <Editor
                height="70vh"
                defaultLanguage="yaml"
                language={language || "yaml"}
                value={content}
                theme={"vs-dark"}
                defaultValue={content}
                options={options || {readOnly: true}}
            />
        </div>
    );
}

export default TextPreview;