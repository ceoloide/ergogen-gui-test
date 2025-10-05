import React from 'react';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';
import { theme } from '../theme/theme';

const bannerColors = {
  info: {
    background: theme.colors.info,
    text: theme.colors.infoDark,
  },
  warning: {
    background: theme.colors.warning,
    text: theme.colors.warningDark,
  },
  error: {
    background: theme.colors.error,
    text: theme.colors.errorDark,
  },
  success: {
    background: theme.colors.success,
    text: theme.colors.successDark,
  },
  text: theme.colors.text,
};

const BannerIcon = styled.span.attrs({
  className: 'material-symbols-outlined',
})`
  font-size: ${theme.fontSizes.iconLarge};
  margin-right: 1rem;
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
`;

const BannerText = styled.p`
  margin: 0;
`;

const Banner = styled.div<{ type: 'info' | 'warning' | 'error' | 'success' }>`
  padding: 1rem 1.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: ${bannerColors.text};
  background-color: ${({ type }) => bannerColors[type].background};
  border: 1px solid ${({ type }) => bannerColors[type].text};

  .material-symbols-outlined {
    color: ${({ type }) => bannerColors[type].text};
  }
`;

const BannersContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  padding: 0 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${bannerColors.text};
  font-size: ${theme.fontSizes.h3};
  cursor: pointer;
  padding: 0;
  line-height: 1;
  margin-left: auto;
  padding-left: 1rem;
`;

const Banners = () => {
  const configContext = useConfigContext();

  if (!configContext) {
    return null;
  }

  const { error, deprecationWarning, clearError, clearWarning } = configContext;

  return (
    <BannersContainer>
      {deprecationWarning && (
        <Banner type="warning">
          <BannerContent>
            <BannerIcon>warning</BannerIcon>
            <BannerText>{deprecationWarning}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearWarning}>&times;</CloseButton>
        </Banner>
      )}
      {error && (
        <Banner type="error">
          <BannerContent>
            <BannerIcon>error</BannerIcon>
            <BannerText>{error}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearError}>&times;</CloseButton>
        </Banner>
      )}
    </BannersContainer>
  );
};

export default Banners;
