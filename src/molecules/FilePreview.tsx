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
  const renderFilePreview = (extension: string) => {
    switch (extension) {
      case 'svg':
        return (
          <SvgPreview svg={previewContent} width={width} height={height} />
        )
      case 'yaml':
        return (
          <TextPreview language="yaml" content={previewContent} />
        )
      case 'txt':
        return (
          <TextPreview language="text" content={previewContent} />
        )
      case 'jscad':
        return (
          <TextPreview language="javascript" content={previewContent} />
        )
      case 'kicad_pcb':
        return (
          <PcbPreview pcb={previewContent} />
        )
      default:
        return "No preview available";
    }
  };

  return (
    <div className={className}>
      {renderFilePreview(previewExtension)}
    </div>
  );
}

export default FilePreview;