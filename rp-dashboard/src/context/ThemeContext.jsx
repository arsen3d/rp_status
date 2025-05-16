import { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

// Create Theme context
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'dark',
});

export const ThemeContextProvider = ({ children }) => {
  // Check local storage for saved theme preference or default to dark
  const storedMode = localStorage.getItem('themeMode') || 'dark';
  const [mode, setMode] = useState(storedMode);

  // Effect to update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeContextProvider;
