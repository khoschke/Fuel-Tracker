import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';

export function FuelReferenceCard({ theme }: { theme: Palette }) {
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Long-run fuel reference</Text>
      <Row label="Fluid" value="1.0–1.3 L per hour" theme={theme} />
      <Row label="Sodium" value="600–1000 mg per hour" theme={theme} />
      <Row label="Carbs" value="60–75 g per hour" theme={theme} />
    </View>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: Palette }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
