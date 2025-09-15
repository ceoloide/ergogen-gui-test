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
`;

const LeftContainer = styled.div`
    display: flex;
    align-items: baseline;
`;

const RightContainer = styled.div`
    display: flex;
    align-items: center;
`;

const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #28a745;
    margin-right: 0.5rem;
`;

const StyledLinkButton = styled.a`
    background-color: transparent;
    border: 1px solid #ccc;
    border-radius: .25rem;
    color: white;
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    text-decoration: none;
    cursor: pointer;
    font-size: 1rem;
    margin-right: 1em;

    .material-symbols-outlined {
        margin-right: 0.5em;
    }
`;

const SettingsButton = styled(Button)`
    height: 34px;
    padding: 8px 12px;
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
                <Title>Ergogen v4.1.0</Title>
            </LeftContainer>
            <RightContainer>
                <StyledLinkButton href="https://docs.ergogen.xyz/" target="_blank" rel="noreferrer">
                    <span className="material-symbols-outlined">description</span>
                    Docs
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