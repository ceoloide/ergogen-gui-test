import Button from "./Button";
import styled from "styled-components";
import {useConfigContext} from "../context/ConfigContext";
import DiscordIcon from "./DiscordIcon";

const HeaderContainer = styled.div`
      width: 100%;
      height: 3em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      background-color: #222222;
`;

const LeftContainer = styled.div`
    display: flex;
`;

const RightContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const AppName = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-right: 0.5rem;
`;

const VersionText = styled.a`
    font-size: 0.75rem;
    color: #28a745;
    text-decoration: none;
    align-items: center;
`;

const StyledLinkButton = styled.a`
    background-color: transparent;
    border: 1px solid #ccc;
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
        background-color: #222222;
    }
`;

const SettingsButton = styled(Button)`
    height: 34px;
    padding: 8px 12px;
    border-radius: 6px;
    .material-symbols-outlined {
        font-size: 16px !important;
    }
`;

const Header = (): JSX.Element => {
    const configContext = useConfigContext();
    const toggleSettings = () => {
      configContext?.setShowSettings(!configContext?.showSettings);
    };
    return (
        <HeaderContainer>
            <LeftContainer>
                <AppName>Ergogen</AppName><VersionText href="https://github.com/ergogen/ergogen" target="_blank" rel="noreferrer">v4.1.0</VersionText>
            </LeftContainer>
            <RightContainer>
                <StyledLinkButton href="https://docs.ergogen.xyz/" target="_blank" rel="noreferrer">
                    <span className="material-symbols-outlined">description</span>
                    <span>Docs</span>
                </StyledLinkButton>
                <StyledLinkButton href="https://discord.gg/nbKcAZB" target="_blank" rel="noreferrer">
                    <DiscordIcon />
                </StyledLinkButton>
                <SettingsButton size="small" onClick={toggleSettings}><span className="material-symbols-outlined">
                {configContext?.showSettings ? "keyboard_alt" : "settings"}</span></SettingsButton>
            </RightContainer>
        </HeaderContainer>
    );
}

export default Header;