import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { colors, radius, spacing } from '../theme';
import { Button, text } from '../components/ui';

/**
 * Row & stitch counter. Counts are saved on the selected project,
 * or kept in a quick counter if no project is selected.
 */
export default function CounterScreen() {
  const { state, update, setActiveProject } = useStore();
  const [quick, setQuick] = useState({ rows: 0, stitches: 0 });

  const activeProjects = state.projects.filter((p) => p.status !== 'finished');
  const project = state.projects.find((p) => p.id === state.activeProjectId);
  const counts = project ? { rows: project.rows, stitches: project.stitches } : quick;

  const change = (key: 'rows' | 'stitches', delta: number) => {
    const value = Math.max(0, counts[key] + delta);
    if (project) update('projects', project.id, { [key]: value });
    else setQuick((q) => ({ ...q, [key]: value }));
  };

  const reset = (key: 'rows' | 'stitches') => change(key, -counts[key]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={text.h1}>Counter</Text>

        <Text style={[text.muted, { marginTop: spacing.md, marginBottom: spacing.sm }]}>COUNTING FOR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          <Chip label="Quick count" selected={!project} onPress={() => setActiveProject(undefined)} />
          {activeProjects.map((p) => (
            <Chip
              key={p.id}
              label={`${p.craft === 'knit' ? '🧶' : '🪝'} ${p.name}`}
              selected={project?.id === p.id}
              onPress={() => setActiveProject(p.id)}
            />
          ))}
        </ScrollView>

        <CounterBlock
          label="Rows"
          value={counts.rows}
          big
          onPlus={() => change('rows', 1)}
          onMinus={() => change('rows', -1)}
          onReset={() => reset('rows')}
        />
        <CounterBlock
          label="Stitches"
          value={counts.stitches}
          onPlus={() => change('stitches', 1)}
          onMinus={() => change('stitches', -1)}
          onReset={() => reset('stitches')}
        />
        {!project && (
          <Text style={[text.muted, { textAlign: 'center', marginTop: spacing.sm }]}>
            Tip: pick a project above to save your count with it.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function CounterBlock(props: {
  label: string;
  value: number;
  big?: boolean;
  onPlus: () => void;
  onMinus: () => void;
  onReset: () => void;
}) {
  const { label, value, big } = props;
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text style={text.h2}>{label}</Text>
        <Button title="Reset" variant="ghost" onPress={props.onReset} style={{ paddingVertical: 4 }} />
      </View>
      <Pressable onPress={props.onPlus} accessibilityLabel={`Add one ${label.toLowerCase()}`}>
        <Text style={[styles.value, big && { fontSize: 96 }]}>{value}</Text>
      </Pressable>
      <View style={styles.row}>
        <Pressable onPress={props.onMinus} style={[styles.round, { backgroundColor: colors.border }]}>
          <Text style={[styles.roundText, { color: colors.text }]}>−</Text>
        </Pressable>
        <Pressable onPress={props.onPlus} style={[styles.round, styles.plus, big && { width: 96, height: 96 }]}>
          <Text style={styles.roundText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '600', color: colors.text },
  block: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' },
  value: { fontSize: 64, fontWeight: '800', color: colors.primaryDark, marginVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  round: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  plus: { backgroundColor: colors.primary },
  roundText: { fontSize: 36, color: '#fff', fontWeight: '700', lineHeight: 40 },
});
