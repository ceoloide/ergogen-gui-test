import Button from "./Button";
import styled from "styled-components";
import {useConfigContext} from "../context/ConfigContext";
import DiscordIcon from "./DiscordIcon";

/**
 * A styled container for the entire header.
 */
const HeaderContainer = styled.div`
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
    gap: 16px;
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
    height: 18px;
`;

/**
 * A styled div for the application name.
 */
const AppName = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-right: 0.5rem;
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

/**
 * A responsive button that is only visible on smaller screens.
 * Note: This component is defined but not currently used in the Header.
 */
const LeftPanelButton = styled(OutlineIconButton)`
@media (min-width: 640px) {
    display: none;
}
`;

/**
 * A styled button with an accent color, extending the base Button component.
 */
const AccentIconButton = styled(Button)`
    height: 34px;
    padding: 8px 12px;
    border-radius: 6px;
    .material-symbols-outlined {
        font-size: 16px !important;
    }
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

    /**
     * Toggles the visibility of the settings panel.
     */
    const toggleSettings = () => {
      configContext?.setShowSettings(!configContext?.showSettings);
    };
    return (
        <HeaderContainer>
            <LeftContainer>
                {/* <LeftPanelButton onClick={() => window.location.reload()}><span className="material-symbols-outlined">left_panel_open</span></LeftPanelButton> */}
                <ErgogenLogo><AppName>Ergogen</AppName><VersionText href="https://github.com/ergogen/ergogen" target="_blank" rel="noreferrer">v4.1.0</VersionText></ErgogenLogo>
            </LeftContainer>
            <RightContainer>
                <StyledLinkButton href="https://docs.ergogen.xyz/" target="_blank" rel="noreferrer">
                    <span className="material-symbols-outlined">description</span>
                    <span>Docs</span>
                </StyledLinkButton>
                <StyledLinkButton href="https://discord.gg/nbKcAZB" target="_blank" rel="noreferrer">
                    <DiscordIcon />
                </StyledLinkButton>
                <AccentIconButton size="small" onClick={toggleSettings}><span className="material-symbols-outlined">
                {configContext?.showSettings ? "keyboard_alt" : "settings"}</span></AccentIconButton>
            </RightContainer>
        </HeaderContainer>
    );
}

export default Header;