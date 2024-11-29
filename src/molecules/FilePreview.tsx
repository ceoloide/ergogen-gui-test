import PcbPreview from "../atoms/PcbPreview";
import SvgPreview from "../atoms/SvgPreview";
import { useConfigContext } from "../context/ConfigContext";

type Props = {
    previewKey: string,
    previewContent: string,
    width?: number | string,
    height?: number | string,
    className?: string
};

const FilePreview = ({previewKey, previewContent, width = '100%', height = '100%', className}: Props) => {
  const previewExt = previewKey.split(".").slice(-1)[0];
  const previewRoot = previewKey.split(".")[0];
  
    const renderFilePreview = (previewExt: string) => {
      switch (previewExt) {
          case 'svg':
              return (
                  <SvgPreview svg={previewContent} width={width} height={height}/>
              )
          default:
      }
      switch (previewRoot) {
        case 'pcbs':
          return (
            <PcbPreview pcb={previewContent} />
          )
        default:
      }
    };

    return (
        <div className={className}>
            {renderFilePreview(previewExt)}
        </div>
    );
}

export default FilePreview;