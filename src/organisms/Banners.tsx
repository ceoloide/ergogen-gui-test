import React from 'react';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';

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
          <BannerText>{deprecationWarning}</BannerText>
          <CloseButton onClick={clearWarning}>&times;</CloseButton>
        </Banner>
      )}
      {error && (
        <Banner type="error">
          <BannerText>{error}</BannerText>
          <CloseButton onClick={clearError}>&times;</CloseButton>
        </Banner>
      )}
    </BannersContainer>
  );
};

const BannersContainer = styled.div`
  position: fixed;
  top: 80px;
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

const Banner = styled.div<{ type: 'warning' | 'error' }>`
  padding: 1rem;
  border-radius: 4px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ type }) => (type === 'warning' ? '#ffc107' : '#dc3545')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const BannerText = styled.p`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

export default Banners;