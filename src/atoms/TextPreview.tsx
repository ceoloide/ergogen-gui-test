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
                height="80vh"
                language={language}
                value={content}
                theme={"vs-dark"}
                options={options || {readOnly: true}}
            />
        </div>
    );
}

export default TextPreview;