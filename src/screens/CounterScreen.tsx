import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newId, useStore } from '../store';
import { Pattern, Project } from '../types';
import { colors, radius, spacing } from '../theme';
import { Button, text } from '../components/ui';
import { isComplete, nextPosition, prevPosition, resolveStep, trackerOf } from '../pattern';

type Counts = { rows: number; stitches: number };
type Snapshot = { projectId?: string; prev: Record<string, unknown> };

/**
 * Counter tab.
 * - Project with a pattern that has steps → pattern tracker (step + repeat).
 * - Otherwise → simple row & stitch counters.
 * Every change can be undone.
 */
export default function CounterScreen() {
  const { state, add, update, setActiveProject } = useStore();
  const [quick, setQuick] = useState<Counts>({ rows: 0, stitches: 0 });
  const [history, setHistory] = useState<Snapshot[]>([]);

  const activeProjects = state.projects.filter((p) => p.status !== 'finished');
  const project = state.projects.find((p) => p.id === state.activeProjectId);
  const pattern = project ? state.patterns.find((p) => p.id === project.patternId) : undefined;
  const steps = pattern?.steps ?? [];
  const counts: Counts = project ? { rows: project.rows, stitches: project.stitches } : quick;

  // Patterns that have steps to follow, and those not yet used by an active project.
  const followable = state.patterns.filter((p) => (p.steps?.length ?? 0) > 0);
  const unstarted = followable.filter((pt) => !activeProjects.some((pr) => pr.patternId === pt.id));

  /** Start following a pattern: makes a project for it (named after the pattern) and selects it. */
  const startPattern = (pt: Pattern) => {
    const id = newId();
    add('projects', {
      id,
      name: pt.name,
      craft: pt.craft,
      status: 'in progress',
      patternId: pt.id,
      notes: '',
      rows: 0,
      stitches: 0,
      step: 0,
      repeat: 1,
      createdAt: Date.now(),
    });
    setActiveProject(id);
  };

  /** Apply a change to the selected project (or quick counter), remembering the old values for Undo. */
  const apply = (changes: Partial<Project>) => {
    if (project) {
      const prev: Record<string, unknown> = {};
      for (const k of Object.keys(changes)) prev[k] = (project as any)[k];
      setHistory((h) => [...h.slice(-49), { projectId: project.id, prev }]);
      update('projects', project.id, changes);
    } else {
      setHistory((h) => [...h.slice(-49), { prev: { ...quick } }]);
      setQuick((q) => ({ ...q, ...(changes as Partial<Counts>) }));
    }
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    if (last.projectId) update('projects', last.projectId, last.prev as Partial<Project>);
    else setQuick((q) => ({ ...q, ...(last.prev as Partial<Counts>) }));
  };

  const change = (key: keyof Counts, delta: number) => apply({ [key]: Math.max(0, counts[key] + delta) });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <View style={styles.header}>
          <Text style={text.h1}>Counter</Text>
          <Button
            title="↶ Undo"
            variant="ghost"
            onPress={undo}
            style={{ paddingVertical: 6, opacity: history.length ? 1 : 0.35 }}
          />
        </View>

        <Text style={[text.muted, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>COUNTING FOR</Text>
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
          {unstarted.map((pt) => (
            <Chip key={pt.id} label={`📖 ${pt.name}`} selected={false} onPress={() => startPattern(pt)} />
          ))}
        </ScrollView>

        {/* Nothing with steps selected yet: offer the saved patterns right here. */}
        {!(project && steps.length > 0) && followable.length > 0 && (
          <View style={[styles.block, { alignItems: 'stretch' }]}>
            <Text style={text.h2}>Follow a pattern</Text>
            <Text style={[text.muted, { marginTop: 4, marginBottom: spacing.sm }]}>
              {project
                ? `Pick the pattern for “${project.name}” to see each step as you count.`
                : 'Pick a pattern to see each step as you count. Your place is saved.'}
            </Text>
            <View style={styles.optionRow}>
              {followable.map((pt) => (
                <Chip
                  key={pt.id}
                  label={`📖 ${pt.name}`}
                  selected={false}
                  onPress={() => {
                    if (project) apply({ patternId: pt.id, step: 0, repeat: 1 });
                    else {
                      const existing = activeProjects.find((pr) => pr.patternId === pt.id);
                      existing ? setActiveProject(existing.id) : startPattern(pt);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {project && pattern && steps.length > 0 ? (
          <PatternTracker project={project} patternName={pattern.name} steps={steps} target={pattern.repeats} apply={apply} />
        ) : (
          <>
            <CounterBlock
              label="Rows"
              value={counts.rows}
              big
              onPlus={() => change('rows', 1)}
              onMinus={() => change('rows', -1)}
              onReset={() => apply({ rows: 0 })}
            />
            {followable.length === 0 && (
              <Text style={[text.muted, { textAlign: 'center', marginBottom: spacing.md }]}>
                {pattern
                  ? `Add the repeating steps to “${pattern.name}” in the Patterns tab to follow it step by step here.`
                  : 'Save a pattern with its steps in the Patterns tab to follow it step by step here.'}
              </Text>
            )}
          </>
        )}

        <CounterBlock
          label="Stitches"
          value={counts.stitches}
          onPlus={() => change('stitches', 1)}
          onMinus={() => change('stitches', -1)}
          onReset={() => apply({ stitches: 0 })}
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

function PatternTracker({
  project,
  patternName,
  steps,
  target,
  apply,
}: {
  project: Project;
  patternName: string;
  steps: string[];
  target?: number;
  apply: (changes: Partial<Project>) => void;
}) {
  const n = steps.length;
  const t = trackerOf(project, n);
  const done = isComplete(t.repeat, target);
  const current = resolveStep(steps, t.step);

  const rowsDone = done ? n * target! : (t.repeat - 1) * n + t.step;
  const totalRows = target ? n * target : undefined;

  const repeatLabel = done
    ? `All ${target} repeats done 🎉`
    : t.repeatDisplay === 'current'
      ? `Repeat ${t.repeat}${target ? ` of ${target}` : ''}`
      : `${t.repeat - 1}${target ? ` of ${target}` : ''} repeats done`;

  const setRepeat = (delta: number) => {
    // In "done" mode the number shown is repeat - 1, so the same +/- works for both views.
    const max = target ? target + 1 : Infinity;
    const repeat = Math.min(Math.max(t.repeat + delta, 1), max);
    apply({ repeat, step: repeat > (target ?? Infinity) ? n - 1 : t.step });
  };

  const jumpTo = (i: number) => apply({ step: i, repeat: done ? target! : t.repeat });

  const reset = () =>
    Alert.alert('Start over?', 'Go back to step 1 of repeat 1.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: () => apply({ step: 0, repeat: 1 }) },
    ]);

  return (
    <View>
      {/* Overall progress */}
      <View style={styles.block}>
        <Text style={text.muted}>{patternName.toUpperCase()}</Text>
        <Text style={styles.repeatLabel}>{repeatLabel}</Text>
        <View style={styles.repeatRow}>
          <RoundButton label="−" small onPress={() => setRepeat(-1)} />
          <Text style={[text.muted, { flex: 1, textAlign: 'center' }]}>
            {totalRows ? `Row ${Math.min(rowsDone + 1, totalRows)} of ${totalRows}` : `Row ${rowsDone + 1}`}
          </Text>
          <RoundButton label="+" small onPress={() => setRepeat(1)} />
        </View>
        {!!totalRows && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (rowsDone / totalRows) * 100)}%` }]} />
          </View>
        )}
      </View>

      {/* Current step */}
      <Pressable
        onPress={() => apply(nextPosition(t, n, target))}
        style={({ pressed }) => [styles.block, styles.stepCard, pressed && { opacity: 0.9 }]}
        accessibilityLabel="Next step"
      >
        <Text style={styles.stepNumber}>{done ? 'Finished!' : `Step ${t.step + 1} of ${n}`}</Text>
        {!done && (
          <>
            <Text style={styles.stepText}>{current.text}</Text>
            {current.sameAs && <Text style={text.muted}>Same as step {current.sameAs}</Text>}
            <View style={styles.upNext}>
              <Text style={styles.upNextLabel}>
                {t.step === n - 1 ? (target && t.repeat >= target ? 'LAST STEP!' : 'UP NEXT · STEP 1 (NEXT REPEAT)') : `UP NEXT · STEP ${t.step + 2}`}
              </Text>
              {!(t.step === n - 1 && target && t.repeat >= target) && (
                <Text style={text.body}>{resolveStep(steps, t.step === n - 1 ? 0 : t.step + 1).text}</Text>
              )}
            </View>
            <Text style={[text.muted, { marginTop: spacing.sm }]}>Tap card for next step</Text>
          </>
        )}
      </Pressable>
      <View style={styles.navRow}>
        <Button title="◀ Back" variant="secondary" onPress={() => apply(prevPosition(t, n, target))} style={{ flex: 1 }} />
        <Button title="Next step ▶" onPress={() => apply(nextPosition(t, n, target))} style={{ flex: 2 }} />
      </View>

      {/* All steps — tap one to jump there */}
      <View style={styles.block}>
        <Text style={[text.h2, { alignSelf: 'flex-start', marginBottom: spacing.sm }]}>Steps</Text>
        {steps.map((s, i) => {
          const active = !done && i === t.step;
          const r = resolveStep(steps, i);
          return (
            <Pressable key={i} onPress={() => jumpTo(i)} style={[styles.stepRow, active && styles.stepRowActive]}>
              <Text style={[styles.stepRowNum, active && { color: '#fff' }]}>{i + 1}</Text>
              <Text style={[text.body, { flex: 1 }, active && { color: '#fff', fontWeight: '700' }]}>
                {r.sameAs ? `${r.text}  (same as ${r.sameAs})` : r.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ways of counting */}
      <View style={[styles.block, { alignItems: 'stretch' }]}>
        <Text style={[text.h2, { marginBottom: spacing.sm }]}>How you count</Text>
        <Text style={styles.optionLabel}>Show repeats as</Text>
        <View style={styles.optionRow}>
          <Chip label="Repeat I'm on" selected={t.repeatDisplay === 'current'} onPress={() => apply({ repeatDisplay: 'current' })} />
          <Chip label="Repeats finished" selected={t.repeatDisplay === 'done'} onPress={() => apply({ repeatDisplay: 'done' })} />
        </View>
        <Text style={styles.optionLabel}>After the last step</Text>
        <View style={styles.optionRow}>
          <Chip label="Count the repeat for me" selected={t.autoRepeat} onPress={() => apply({ autoRepeat: true })} />
          <Chip label="I'll tap + myself" selected={!t.autoRepeat} onPress={() => apply({ autoRepeat: false })} />
        </View>
        <Button title="Start pattern over" variant="ghost" onPress={reset} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function RoundButton({ label, onPress, small }: { label: string; onPress: () => void; small?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.round, { backgroundColor: colors.border }, small && { width: 44, height: 44 }]}
    >
      <Text style={[styles.roundText, { color: colors.text }, small && { fontSize: 26, lineHeight: 30 }]}>{label}</Text>
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
        <RoundButton label="−" onPress={props.onMinus} />
        <Pressable onPress={props.onPlus} style={[styles.round, styles.plus, big && { width: 96, height: 96 }]}>
          <Text style={styles.roundText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
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
  repeatLabel: { fontSize: 30, fontWeight: '800', color: colors.primaryDark, marginVertical: spacing.sm, textAlign: 'center' },
  repeatRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  progressTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: radius.pill },
  stepCard: { borderColor: colors.primary, borderWidth: 2, marginBottom: spacing.sm },
  stepNumber: { fontSize: 16, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  stepText: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginVertical: spacing.sm },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  stepRowActive: { backgroundColor: colors.primary },
  stepRowNum: { width: 28, fontWeight: '800', color: colors.primaryDark },
  optionLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: spacing.sm, marginBottom: 6, textTransform: 'uppercase' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  upNext: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  upNextLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, marginBottom: 2 },
});
