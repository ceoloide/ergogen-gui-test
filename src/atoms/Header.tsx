import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';
import DiscordIcon from './DiscordIcon';
import GithubIcon from './GithubIcon';

/**
 * A styled container for the entire header.
 */
const HeaderContainer = styled.header`
  width: 100%;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background-color: #222222;
  flex-shrink: 0;
`;

/**
 * A styled container for the left section of the header.
 */
const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: row;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
`;

/**
 * A styled container for the right section of the header.
 */
const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

/**
 * A styled container for the Ergogen logo and name.
 */
const ErgogenLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

/**
 * A styled div for the application name.
 */
const AppName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
`;

/**
 * A styled anchor tag for displaying the version number.
 */
const VersionText = styled.a`
  font-size: 0.75rem;
  color: #28a745;
  text-decoration: none;
  align-items: center;
`;

/**
 * A styled anchor tag that functions as a link button.
 */
const StyledLinkButton = styled.a`
    background-color: transparent;
    border: 1px solid #3f3f3f;
    border-radius: 6px;
    color: white;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    text-decoration: none;
    cursor: pointer;
    font-size: 13px;
    line-height: 16px;
    gap: 6px
    height: 34px;

    .material-symbols-outlined {
        margin-right: 6px;
        font-size: 16px !important;
    }

    &:hover {
        background-color: #3f3f3f;
    }
`;

const DocsButton = styled(StyledLinkButton)`
  @media (max-width: 639px) {
    .material-symbols-outlined {
      margin-right: 0;
    }

    span:not(.material-symbols-outlined) {
      display: none;
    }
  }
`;

/**
 * A styled button with an outline style, typically for icons.
 */
const OutlineIconButton = styled.button`
    background-color: transparent;
    transition: color .15s ease-in-out,
    background-color .15s ease-in-out,
    border-color .15s ease-in-out,
    box-shadow .15s ease-in-out;
    border: 1px solid #3f3f3f;
    border-radius: 6px;
    color: white;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    text-decoration: none;
    cursor: pointer;
    font-size: 13px;
    line-height: 16px;
    gap: 6px
    height: 34px;

    .material-symbols-outlined {
        font-size: 16px !important;
    }

    &:hover {
        background-color: #3f3f3f;
    }
`;

const AccentIconButton = styled(OutlineIconButton)`
  background-color: #28a745;
  border-color: #28a745;

  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
`;

/**
 * A responsive button that is only visible on smaller screens.
 * Note: This component is defined but not currently used in the Header.
 */
const LogoButton = styled(Link)`
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 6px;
`;

/**
 * The main header component for the application.
 * It displays the application logo, name, version, and navigation links.
 * It also includes a button to toggle the settings panel.
 *
 * @returns {JSX.Element} The rendered header component.
 */
const Header = (): JSX.Element => {
  const configContext = useConfigContext();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Toggles the visibility of the settings panel.
   */
  const toggleSettings = () => {
    configContext?.setShowSettings(!configContext?.showSettings);
  };

  const handleNewClick = () => {
    navigate('/new');
  };

  return (
    <HeaderContainer>
      <LeftContainer>
        {/* <LeftPanelButton onClick={() => window.location.reload()}><span className="material-symbols-outlined">left_panel_open</span></LeftPanelButton> */}
        <ErgogenLogo>
          <LogoButton to="/">
            <LogoImage src={'ergogen.png'} />
          </LogoButton>
          <AppName>Ergogen</AppName>
          <VersionText
            href="https://github.com/ergogen/ergogen"
            target="_blank"
            rel="noreferrer"
          >
            v4.1.0
          </VersionText>
        </ErgogenLogo>
      </LeftContainer>
      <RightContainer>
        {location.pathname === '/' && (
          <AccentIconButton onClick={handleNewClick}>
            <span className="material-symbols-outlined">add_2</span>
          </AccentIconButton>
        )}
        <DocsButton
          href="https://docs.ergogen.xyz/"
          target="_blank"
          rel="noreferrer"
        >
          <span className="material-symbols-outlined">description</span>
          <span>Docs</span>
        </DocsButton>
        <StyledLinkButton
          href="https://discord.gg/nbKcAZB"
          target="_blank"
          rel="noreferrer"
        >
          <DiscordIcon />
        </StyledLinkButton>
        <StyledLinkButton
          href="https://github.com/ceoloide/ergogen-gui"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon />
        </StyledLinkButton>
        <OutlineIconButton onClick={toggleSettings}>
          <span className="material-symbols-outlined">
            {configContext?.showSettings ? 'keyboard_alt' : 'settings'}
          </span>
        </OutlineIconButton>
      </RightContainer>
    </HeaderContainer>
  );
};

export default Header;
