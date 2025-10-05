import React from 'react';
import styled from 'styled-components';
import { theme } from '../theme/theme';

/**
 * Props for the Button component.
 * @typedef {object} Props
 * @property {string} [size] - The size of the button. Accepts 'icon', 'sm'/'small', 'md'/'medium', 'lg'/'large'.
 * @property {React.ReactNode} children - The content to be displayed inside the button.
 * @property {React.MouseEventHandler<HTMLButtonElement>} [onClick] - Optional click handler.
 */
type Props = {
  size?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
};

/**
 * A standard styled button component.
 */
const Button = styled.button`
  display: inline-block;
  border: none;
  padding: 1rem 2rem;
  margin: 0;
  text-decoration: none;
  background-color: ${theme.colors.accent};
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  color: ${theme.colors.white};
  font-family: ${theme.fonts.body};
  cursor: pointer;
  text-align: center;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:hover {
    background-color: ${theme.colors.accentDark};
    border-color: ${theme.colors.accentDarker};
  }

  &:active {
    transform: scale(0.98);
    outline: 2px solid ${theme.colors.white};
    outline-offset: -5px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * A medium-sized variant of the Button.
 */
const MediumButton = styled(Button)`
  padding: 0.7rem 1.4rem;
  font-size: ${theme.fontSizes.base};
`;

/**
 * A small-sized variant of the Button.
 */
const SmallButton = styled(Button)`
  padding: 8px 12px;
  font-size: ${theme.fontSizes.sm};
`;

/**
 * An icon-sized variant of the Button.
 */
const IconButton = styled(Button)`
  padding: 8px 12px;
  font-size: ${theme.fontSizes.xs};
`;

/**
 * Renders a button component with a specified size.
 * This component acts as a factory, returning a button of a specific size
 * based on the `size` prop.
 *
 * @param {Props} props - The props for the component.
 * @param {string} [props.size="large"] - The size of the button. Can be 'icon', 'sm'/'small', 'md'/'medium', or 'lg'/'large'.
 * @param {React.ReactNode} props.children - The content of the button.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick] - The function to call on button click.
 * @returns {JSX.Element} A styled Button component based on the size prop.
 */
const styledButton = ({ size, ...rest }: Props): JSX.Element => {
  switch (size) {
    case 'icon':
      return <IconButton {...rest} />;
    case 'sm':
    case 'small':
      return <SmallButton {...rest} />;
    case 'md':
    case 'medium':
      return <MediumButton {...rest} />;
    case 'lg':
    case 'large':
    default:
      return <Button {...rest} />;
  }
};

export default styledButton;
