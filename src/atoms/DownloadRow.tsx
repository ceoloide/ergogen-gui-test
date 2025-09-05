import Button from "./Button";
import styled from "styled-components";
import {Dispatch, SetStateAction} from "react";

export interface Preview {
  extension: string,
  key: string,
  content: string
}

type Props = {
    fileName: string,
    extension: string,
    content: string,
    preview?: Preview,
    setPreview: (preview: Preview) => void,
    setTabIndex: Dispatch<SetStateAction<number>> | undefined
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em
`;

const FileName = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Buttons = styled.div`
    white-space: nowrap;
`;

const StyledButton = styled(Button)`
margin-right: 0.5em;
`;

const DownloadRow = ({fileName, extension, content, preview, setPreview, setTabIndex}: Props): JSX.Element => {
    return (
        <Row>
            <FileName>{fileName}.{extension}</FileName>
            <Buttons>
                {preview && (
                    <StyledButton size={"icon"}
                        onClick={()=>{
                            setPreview(preview);
                            setTabIndex?.(0)
                        }}
                        data-testid={`preview-icon-${fileName}`}
                    >
                        {/* @ts-ignore */}
                        <span class="material-symbols-outlined">visibility</span>
                    </StyledButton>
                )}
                <a target={"_blank"}
                   rel={"noreferrer"}
                   download={`${fileName}.${extension}`}
                   href={window.URL.createObjectURL(new Blob([content], {type: "octet/stream"}))}>
                    <Button size={"icon"}>
                        {/* @ts-ignore */}
                        <span class="material-symbols-outlined">download</span>
                    </Button>
                </a>
            </Buttons>
        </Row>
    );
};

export default DownloadRow;