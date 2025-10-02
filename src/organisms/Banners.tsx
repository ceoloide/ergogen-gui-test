import React from 'react';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';

const procoreColors = {
  red50: 'hsl(360, 70%, 50%)',
  red98: 'hsl(360, 70%, 98%)',
  yellow40: 'hsl(45, 85%, 40%)',
  yellow94: 'hsl(45, 85%, 94%)',
  gray15: 'hsl(200, 8%, 15%)'
};

const BannerIcon = styled.span.attrs({
  className: 'material-symbols-outlined'
})`
  font-size: 24px;
  margin-right: 1rem;
`;

const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const BannerHeading = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const BannerText = styled.p`
  margin: 0.25rem 0 0 0;
`;

const Banner = styled.div<{ type: 'warning' | 'error' }>`
  position: relative;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: ${procoreColors.gray15};
  background-color: ${({ type }) => (type === 'warning' ? procoreColors.yellow94 : procoreColors.red98)};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${({ type }) => (type === 'warning' ? procoreColors.yellow40 : procoreColors.red50)};
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .material-symbols-outlined {
    color: ${({ type }) => (type === 'warning' ? procoreColors.yellow40 : procoreColors.red50)};
  }
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
          <BannerIcon>warning</BannerIcon>
          <BannerContent>
            <BannerHeading>Warning</BannerHeading>
            <BannerText>{deprecationWarning}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearWarning}>&times;</CloseButton>
        </Banner>
      )}
      {error && (
        <Banner type="error">
          <BannerIcon>error</BannerIcon>
          <BannerContent>
            <BannerHeading>Error</BannerHeading>
            <BannerText>{error}</BannerText>
          </BannerContent>
          <CloseButton onClick={clearError}>&times;</CloseButton>
        </Banner>
      )}
    </BannersContainer>
  );
};

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
  color: ${procoreColors.gray15};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  margin-left: auto;
  padding-left: 1rem;
`;

export default Banners;