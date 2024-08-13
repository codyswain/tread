export const colors = {
    light: {
      primary: '#007AFF',
      primaryHover: '#0056b3',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      text: '#363537',
      buttonText: '#FFFFFF',
      navBackground: 'rgba(255, 255, 255, 0.8)',
      navText: '#333',
      border: '#E0E0E0',
      inputBackground: '#FFFFFF',
    },
    dark: {
      primary: '#4DA8FF',
      primaryHover: '#3a8cd8',
      background: '#1E1E1E',
      cardBackground: '#2C2C2C',
      text: '#FAFAFA',
      buttonText: '#FFFFFF',
      navBackground: 'rgba(40, 40, 40, 0.8)',
      navText: '#FAFAFA',
      border: '#444444',
      inputBackground: '#363537',
    },
  };
  
  export const lightTheme = {
    ...colors.light,
    activeNavText: colors.light.primary,
  };
  
  export const darkTheme = {
    ...colors.dark,
    activeNavText: colors.dark.primary,
  };
  
  export type ThemeType = typeof lightTheme;