import { useColorScheme } from 'react-native';
import { light, dark, Palette } from './colors';

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
