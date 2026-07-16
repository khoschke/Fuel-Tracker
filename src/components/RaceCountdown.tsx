import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';

interface Props {
  raceName: string;
  daysRemaining: number;
  theme: Palette;
}

export function RaceCountdown({ raceName, daysRemaining, theme }: Props) {
  const label =
    daysRemaining > 1
      ? `${daysRemaining} days to ${raceName}`
      : daysRemaining === 1
      ? `1 day to ${raceName}`
      : daysRemaining === 0
      ? `${raceName} is today`
      : `${raceName} was ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textPrimary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
