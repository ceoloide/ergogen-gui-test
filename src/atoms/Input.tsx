import styled from 'styled-components';
import { theme } from '../theme/theme';

/**
 * A styled text input component.
 * It accepts a `$size` prop to control its margin and padding.
 *
 * @param {object} props - The props for the component.
 * @param {string} [props.$size="0.5em"] - The size for margin and padding.
 *
 * @example
 * <Input $size="1em" />
 */
const styledInput = styled.input.attrs<{ $size?: string }>((props) => ({
  // we can define static props
  type: 'text',

  // or we can define dynamic ones
  $size: props.$size || '0.5em',
}))`
  font-size: ${theme.fontSizes.base};
  border: 2px solid ${theme.colors.borderLight};
  border-radius: 3px;
  background: ${theme.colors.backgroundLight};
  color: ${theme.colors.white};
  /* here we use the dynamically computed prop */
  margin: ${(props) => props.$size};
  padding: ${(props) => props.$size};
`;

export default styledInput;
