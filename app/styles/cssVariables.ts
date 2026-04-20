import { colors } from './colors';

export function buildCssVariables(): Record<string, string> {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    acc[`--color-${key}`] = value;
    return acc;
  }, {} as Record<string, string>);
}
