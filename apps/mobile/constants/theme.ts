/**
 * Light Expedia-style palette — white surfaces, navy text, golden-amber accents.
 * Matches the web dashboard (apps/web) color scheme.
 */

export const Luxury = {
  bg: '#F5F6FA',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F0F1F5',
  border: '#E5E7EB',
  borderSubtle: '#F0F1F5',
  gold: '#D4960A',
  goldBright: '#B8860B',
  goldDim: 'rgba(212, 150, 10, 0.08)',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accentBlue: '#1E3A5F',
  accentBlueMuted: 'rgba(30, 58, 95, 0.08)',
  success: '#16A34A',
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  navy: '#1E3A5F',
};

export const Palette = {
  navy: '#1E3A5F',
  blue: '#2563EB',
  blueLight: 'rgba(37, 99, 235, 0.08)',
  yellow: Luxury.gold,
  white: '#FFFFFF',
  bg: Luxury.bg,
  card: Luxury.surface,
  text: Luxury.text,
  textSecondary: Luxury.textSecondary,
  textTertiary: Luxury.textMuted,
  border: Luxury.border,
  red: '#EF4444',
  green: '#16A34A',
  greenLight: 'rgba(22, 163, 74, 0.08)',
  orange: '#E8850C',
  orangeLight: 'rgba(232, 133, 12, 0.08)',
  purple: '#7C3AED',
  purpleLight: 'rgba(124, 58, 237, 0.08)',
};

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  rounded: 'Poppins_500Medium',
  mono: 'Poppins_400Regular',
};

export const Colors = {
  light: {
    text: Luxury.text,
    background: Luxury.bg,
    tint: Luxury.gold,
    icon: Luxury.textSecondary,
    tabIconDefault: Luxury.textMuted,
    tabIconSelected: Luxury.gold,
  },
  dark: {
    text: Luxury.text,
    background: Luxury.bg,
    tint: Luxury.gold,
    icon: Luxury.textSecondary,
    tabIconDefault: Luxury.textMuted,
    tabIconSelected: Luxury.gold,
  },
};
