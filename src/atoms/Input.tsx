import styled from 'styled-components';
import { theme } from '../theme/theme';

/**
 * Props for the Input component.
 * @typedef {object} Props
 * @property {string} [aria-label] - An optional aria-label for the input.
 * @property {string} [data-testid] - An optional data-testid for testing purposes.
 * @property {string} [$size] - The size for margin and padding.
 */
type Props = {
  'aria-label'?: string;
  'data-testid'?: string;
  $size?: string;
};

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
const styledInput = styled.input.attrs<Props>((props) => ({
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
