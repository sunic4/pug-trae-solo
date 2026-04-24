export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: string;
  textSecondary: string;
  border: string;
  disabled: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    loose: number;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BorderRadius {
  none: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Shadows {
  sm: string;
  base: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    background: '#ffffff',
    surface: '#f9fafb',
    error: '#ef4444',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    disabled: '#9ca3af',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#111827',
    onSurface: '#111827',
    onError: '#ffffff',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      loose: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

export const darkTheme: Theme = {
  ...defaultTheme,
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    background: '#111827',
    surface: '#1f2937',
    error: '#ef4444',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    disabled: '#6b7280',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#f9fafb',
    onSurface: '#f9fafb',
    onError: '#ffffff',
  },
};
