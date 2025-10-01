import React, { createContext, useState, useContext, ReactNode } from 'react';

interface BannerState {
  warning: string | null;
  error: string | null;
}

interface BannerContextType extends BannerState {
  setWarning: (message: string | null) => void;
  setError: (message: string | null) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banners, setBanners] = useState<BannerState>({
    warning: null,
    error: null,
  });

  const setWarning = (message: string | null) => {
    setBanners((prev) => ({ ...prev, warning: message }));
  };

  const setError = (message: string | null) => {
    setBanners((prev) => ({ ...prev, error: message }));
  };

  return (
    <BannerContext.Provider value={{ ...banners, setWarning, setError }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
};