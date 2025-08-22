type Props = {
  pcb: string,
  key: string,
};

const PcbPreview = ({pcb, key}: Props): JSX.Element => (
  <kicanvas-embed
    key={key}
    controls="full"
    controlslist="nodownload nooverlay"
    theme="kicad"
    >
      <kicanvas-source type="board">
        {pcb}
      </kicanvas-source>
    </kicanvas-embed>
);

export default PcbPreview;
