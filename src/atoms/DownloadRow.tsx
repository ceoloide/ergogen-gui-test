import Button from "./Button";
import styled from "styled-components";
import {Dispatch, SetStateAction} from "react";

/**
 * Interface for a preview object.
 * @interface Preview
 * @property {string} extension - The file extension of the preview content.
 * @property {string} key - A unique key for the preview.
 * @property {string} content - The content of the preview.
 */
export interface Preview {
  extension: string,
  key: string,
  content: string
}

/**
 * Props for the DownloadRow component.
 * @typedef {object} Props
 * @property {string} fileName - The name of the file to be downloaded.
 * @property {string} extension - The file extension.
 * @property {string} content - The content of the file.
 * @property {Preview} [preview] - An optional preview object. If provided, a preview button is shown.
 * @property {(preview: Preview) => void} setPreview - Function to set the active preview.
 * @property {Dispatch<SetStateAction<number>>} [setTabIndex] - Optional function to set the active tab index.
 */
type Props = {
    fileName: string,
    extension: string,
    content: string,
    preview?: Preview,
    setPreview: (preview: Preview) => void,
    previewKey: string,
    setTabIndex: Dispatch<SetStateAction<number>> | undefined
};

/**
 * A styled div for the row layout.
 */
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
`;

/**
 * A styled div for displaying the file name, with ellipsis for overflow.
 */
const FileName = styled.div<{ active: boolean, hasPreview: boolean }>`
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    cursor: ${props => props.hasPreview ? 'pointer' : 'default'};
    border-bottom: ${props => props.active ? '2px solid #28a745' : '2px solid transparent'};
    border-top: 2px solid transparent;
`;

/**
 * A styled div to contain the action buttons.
 */
const Buttons = styled.div`
    white-space: nowrap;
    display: flex;
    gap: 10px;
    align-items: center;
`;

/**
 * A styled button with specific dimensions and hover effects.
 * Note: This component is currently unused in the DownloadRow component.
 */
const StyledButton = styled(Button)`
    height: 34px;
    padding: 8px 12px;
    border-radius: 6px;
    
    .material-symbols-outlined {
        font-size: 16px !important;
    }
        
    &:hover {
        background-color: #3f3f3f;
    }
`;

/**
 * A styled anchor tag that looks like a button.
 * Used for preview and download actions.
 */
const StyledLinkButton = styled.a`
    background-color: transparent;
    border: 1px solid #3f3f3f;
    border-radius: 6px;
    color: white;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    text-decoration: none;
    cursor: pointer;
    font-size: 13px;
    line-height: 16px;
    gap: 6px
    height: 34px;

    .material-symbols-outlined {
        font-size: 16px !important;
    }

    &:hover {
        background-color: #3f3f3f;
    }
`;

/**
 * A component that displays a file name and provides buttons for previewing and downloading.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} A row with the file name and action buttons.
 */
const DownloadRow = ({fileName, extension, content, preview, setPreview, previewKey, setTabIndex}: Props): JSX.Element => {
    const isActive = preview?.key === previewKey;

    const handlePreviewClick = () => {
        if (preview) {
            setPreview(preview);
            setTabIndex?.(0)
        }
    }

    return (
        <Row>
            <FileName active={isActive} hasPreview={!!preview} onClick={handlePreviewClick}>
                {fileName}.{extension}
            </FileName>
            <Buttons>
                <StyledLinkButton target={"_blank"}
                   rel={"noreferrer"}
                   download={`${fileName}.${extension}`}
                   href={window.URL.createObjectURL(new Blob([content], {type: "octet/stream"}))}>
                    <span className="material-symbols-outlined">download</span>
                </StyledLinkButton>
            </Buttons>
        </Row>
    );
};

export default DownloadRow;