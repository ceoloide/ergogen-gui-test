/**
 * Props for the PcbPreview component.
 * @typedef {object} Props
 * @property {string} pcb - The KiCad PCB file content as a string.
 * @property {string} key - A unique key for the component, important for React's rendering logic.
 */
type Props = {
  pcb: string,
  key: string,
};

/**
 * A React component that embeds a KiCad PCB preview using the `<kicanvas-embed>` custom element.
 * This component takes the PCB data as a string and renders it within an interactive canvas.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} A `<kicanvas-embed>` element containing the PCB source.
 */
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
