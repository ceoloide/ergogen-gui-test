import PcbPreview from "../atoms/PcbPreview";
import SvgPreview from "../atoms/SvgPreview";
import TextPreview from "../atoms/TextPreview";

type Props = {
  previewExtension: string,
  previewKey: string,
  previewContent: string,
  width?: number | string,
  height?: number | string,
  className?: string
};

const FilePreview = ({ previewExtension, previewContent, width = '100%', height = '100%', className }: Props) => {
  const previewExt = previewExtension;

  const renderFilePreview = (previewExtension: string) => {
    switch (previewExtension) {
      case 'svg':
        return (
          <SvgPreview svg={previewContent} width={width} height={height} />
        )
      case 'yaml':
      case 'txt':
        return (
          <TextPreview content={previewContent} />
        )
      case 'kicad_pcb':
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