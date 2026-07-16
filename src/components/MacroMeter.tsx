import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';
import { round, clampToZero } from '../utils/format';

interface Props {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  theme: Palette;
  emphasized?: boolean;
}

export function MacroMeter({ label, value, target, unit, color, theme, emphasized }: Props) {
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.min(100, (value / safeTarget) * 100);
  const remaining = clampToZero(target - value);
  const over = value > target ? round(value - target) : 0;
  const barHeight = emphasized ? 18 : 12;

  return (
    <View style={[styles.container, emphasized && { ...styles.emphasizedContainer, backgroundColor: theme.card, borderColor: color }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.textPrimary }, emphasized && styles.labelEmphasized]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>
          {round(value)} / {round(target)}{unit}
        </Text>
      </View>
      <View style={[styles.track, { height: barHeight, backgroundColor: theme.gridline }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: color, height: barHeight },
          ]}
        />
      </View>
      <Text style={[styles.subtext, { color: over > 0 ? theme.critical : theme.textMuted }]}>
        {over > 0 ? `▲ ${over}${unit} over target` : `${round(remaining)}${unit} to go`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  emphasizedContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelEmphasized: {
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
  subtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
