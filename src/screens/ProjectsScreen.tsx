import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newId, useStore } from '../store';
import { Project, ProjectStatus } from '../types';
import { colors, radius, spacing } from '../theme';
import { Card, EmptyState, Fab, Tag, text } from '../components/ui';
import { Field, FormModal, FormValues } from '../components/FormModal';

const STATUSES: ProjectStatus[] = ['planned', 'in progress', 'finished'];
const statusColor: Record<ProjectStatus, string> = {
  planned: colors.border,
  'in progress': colors.accent,
  finished: colors.secondary,
};

export default function ProjectsScreen() {
  const { state, add, update, remove } = useStore();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [editing, setEditing] = useState<Project | 'new' | null>(null);

  const list = filter === 'all' ? state.projects : state.projects.filter((p) => p.status === filter);

  const fields: Field[] = [
    { key: 'name', label: 'Project name', type: 'text', placeholder: 'Cozy granny-square blanket', required: true },
    { key: 'craft', label: 'Craft', type: 'choice', options: [{ label: '🧶 Knit', value: 'knit' }, { label: '🪝 Crochet', value: 'crochet' }] },
    { key: 'status', label: 'Status', type: 'choice', options: STATUSES.map((s) => ({ label: s, value: s })) },
    {
      key: 'patternId',
      label: 'Pattern',
      type: 'choice',
      options: [{ label: 'None', value: undefined }, ...state.patterns.map((p) => ({ label: p.name, value: p.id }))],
    },
    {
      key: 'yarnId',
      label: 'Yarn',
      type: 'choice',
      options: [{ label: 'None', value: undefined }, ...state.yarns.map((y) => ({ label: `${y.name} · ${y.color}`, value: y.id }))],
    },
    { key: 'notes', label: 'Notes', type: 'multiline', placeholder: 'Hook size, changes, reminders…' },
  ];

  const initial: FormValues =
    editing && editing !== 'new' ? editing : { craft: 'crochet', status: 'in progress', notes: '' };

  const save = (v: FormValues) => {
    const data = {
      name: String(v.name).trim(),
      craft: v.craft,
      status: v.status,
      patternId: v.patternId,
      yarnId: v.yarnId,
      notes: v.notes ?? '',
    };
    if (editing === 'new') add('projects', { ...data, id: newId(), rows: 0, stitches: 0, createdAt: Date.now() });
    else if (editing) update('projects', editing.id, data);
    setEditing(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={text.h1}>Projects</Text>
        <View style={styles.filters}>
          {(['all', ...STATUSES] as const).map((s) => (
            <Pressable key={s} onPress={() => setFilter(s)} style={[styles.filter, filter === s && styles.filterOn]}>
              <Text style={[styles.filterText, filter === s && { color: '#fff' }]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState emoji="🧶" title="No projects yet" hint="Tap + to start tracking your first make." />
        }
        renderItem={({ item }) => {
          const pattern = state.patterns.find((p) => p.id === item.patternId);
          const yarn = state.yarns.find((y) => y.id === item.yarnId);
          return (
            <Card onPress={() => setEditing(item)}>
              <Text style={text.h2}>
                {item.craft === 'knit' ? '🧶' : '🪝'} {item.name}
              </Text>
              <View style={styles.tags}>
                <Tag label={item.status} color={statusColor[item.status]} />
                <Tag label={`Row ${item.rows}`} color={colors.border} />
              </View>
              {pattern && <Text style={text.muted}>Pattern: {pattern.name}</Text>}
              {yarn && <Text style={text.muted}>Yarn: {yarn.name} · {yarn.color}</Text>}
              {!!item.notes && (
                <Text style={[text.body, { marginTop: 6 }]} numberOfLines={2}>
                  {item.notes}
                </Text>
              )}
            </Card>
          );
        }}
      />

      <Fab onPress={() => setEditing('new')} />

      <FormModal
        visible={editing !== null}
        title={editing === 'new' ? 'New project' : 'Edit project'}
        fields={fields}
        initialValues={initial}
        onSubmit={save}
        onClose={() => setEditing(null)}
        onDelete={
          editing && editing !== 'new'
            ? () => {
                remove('projects', editing.id);
                setEditing(null);
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  tags: { flexDirection: 'row', marginVertical: 8 },
});
