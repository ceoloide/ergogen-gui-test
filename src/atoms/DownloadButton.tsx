import styled from 'styled-components';
import Button from './Button';

/**
 * A styled download button, extending the base Button component.
 * It is styled to be a square, suitable for containing an icon.
 *
 * @component
 * @example
 * return (
 *   <DownloadButton>
 *     <DownloadIcon />
 *   </DownloadButton>
 * )
 */
const DownloadButton = styled(Button)`
  width: 3.7rem;
  height: 3.7rem;
  padding: 1rem;
`;

export default DownloadButton;
