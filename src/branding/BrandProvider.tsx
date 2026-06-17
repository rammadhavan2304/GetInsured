import { CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrandConfig, BrandId, brands, createBrandTheme } from './brandConfig';

const BRAND_STORAGE_KEY = 'getinsured.brand';

interface BrandContextValue {
  brand: BrandConfig;
  brandId: BrandId;
  setBrandId: (brandId: BrandId) => void;
  isThemeB: boolean;
  toggleThemeB: () => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

const getInitialBrandId = (): BrandId => {
  try {
    const urlBrand = new URLSearchParams(window.location.search).get('brand');
    if (urlBrand === 'themeB' || urlBrand === 'uniqa') return 'themeB';
    if (urlBrand === 'getinsured') return 'getinsured';

    const stored = window.localStorage.getItem(BRAND_STORAGE_KEY);
    return stored === 'themeB' ? 'themeB' : 'getinsured';
  } catch {
    return 'getinsured';
  }
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brandId, setBrandIdState] = useState<BrandId>(getInitialBrandId);
  const brand = brands[brandId];
  const theme = useMemo(() => createBrandTheme(brand), [brand]);

  const setBrandId = (nextBrandId: BrandId) => {
    setBrandIdState(nextBrandId);
    window.localStorage.setItem(BRAND_STORAGE_KEY, nextBrandId);
  };

  useEffect(() => {
    document.documentElement.dataset.brand = brand.id;
    Object.entries(brand.cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [brand]);

  const value = useMemo(
    () => ({
      brand,
      brandId,
      setBrandId,
      isThemeB: brandId === 'themeB',
      toggleThemeB: () => setBrandId(brandId === 'themeB' ? 'getinsured' : 'themeB')
    }),
    [brand, brandId]
  );

  return (
    <BrandContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrandContext.Provider>
  );
}

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used inside BrandProvider');
  return context;
};
