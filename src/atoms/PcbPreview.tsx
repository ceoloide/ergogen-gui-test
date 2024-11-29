type Props = {
  pcb: string,
};

const PcbPreview = ({pcb}: Props): JSX.Element => (
  <kicanvas-embed
    controls="full"
    controlslist="nodownload nooverlay"
    theme="kicad"
    >
      <kicanvas-source type="pcb">
        {pcb}
      </kicanvas-source>
    </kicanvas-embed>
);

export default PcbPreview;
