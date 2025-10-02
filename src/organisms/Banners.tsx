import React from 'react';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';

const bannerColors = {
  info: {
    background: 'hsl(206, 94%, 92%)',
    text: 'hsl(206, 100%, 30%)',
  },
  warning: {
    background: 'hsl(45, 100%, 90%)',
    text: 'hsl(32, 79%, 40%)',
  },
  error: {
    background: 'hsl(360, 100%, 94%)',
    text: 'hsl(360, 70%, 50%)',
  },
  success: {
    background: 'hsl(120, 73%, 92%)',
    text: 'hsl(120, 50%, 35%)',
  },
  text: 'hsl(200, 8%, 15%)',
};

const BannerIcon = styled.span.attrs({
  className: 'material-symbols-outlined'
})`
  font-size: 24px;
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
  font-size: 1.5rem;
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
            <BannerText>Warning: {deprecationWarning}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearWarning}>&times;</CloseButton>
        </Banner>
      )}
      {error && (
        <Banner type="error">
          <BannerContent>
            <BannerIcon>error</BannerIcon>
            <BannerText>Error: {error}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearError}>&times;</CloseButton>
        </Banner>
      )}
    </BannersContainer>
  );
};

export default Banners;