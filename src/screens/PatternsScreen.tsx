import React, { useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newId, useStore } from '../store';
import { Difficulty, Pattern } from '../types';
import { colors, radius, spacing } from '../theme';
import { Button, Card, EmptyState, Fab, Tag, text } from '../components/ui';
import { Field, FormModal, FormValues } from '../components/FormModal';

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'intermediate', 'advanced'];

const fields: Field[] = [
  { key: 'name', label: 'Pattern name', type: 'text', placeholder: 'Classic ribbed beanie', required: true },
  { key: 'craft', label: 'Craft', type: 'choice', options: [{ label: '🧶 Knit', value: 'knit' }, { label: '🪝 Crochet', value: 'crochet' }] },
  { key: 'difficulty', label: 'Difficulty', type: 'choice', options: DIFFICULTIES.map((d) => ({ label: d, value: d })) },
  { key: 'link', label: 'Link', type: 'text', placeholder: 'https://…' },
  { key: 'notes', label: 'Notes', type: 'multiline', placeholder: 'Gauge, hook/needle size, modifications…' },
];

export default function PatternsScreen() {
  const { state, add, update, remove } = useStore();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Pattern | 'new' | null>(null);

  const q = query.trim().toLowerCase();
  const list = q
    ? state.patterns.filter((p) => `${p.name} ${p.notes} ${p.craft}`.toLowerCase().includes(q))
    : state.patterns;

  const initial: FormValues =
    editing && editing !== 'new' ? editing : { craft: 'crochet', difficulty: 'easy', link: '', notes: '' };

  const save = (v: FormValues) => {
    const data = {
      name: String(v.name).trim(),
      craft: v.craft,
      difficulty: v.difficulty,
      link: String(v.link ?? '').trim(),
      notes: v.notes ?? '',
    };
    if (editing === 'new') add('patterns', { ...data, id: newId(), createdAt: Date.now() });
    else if (editing) update('patterns', editing.id, data);
    setEditing(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={text.h1}>Patterns</Text>
        <TextInput
          style={styles.search}
          placeholder="Search patterns"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState emoji="📖" title="Your pattern library is empty" hint="Tap + to save a pattern you love." />
        }
        renderItem={({ item }) => (
          <Card onPress={() => setEditing(item)}>
            <Text style={text.h2}>
              {item.craft === 'knit' ? '🧶' : '🪝'} {item.name}
            </Text>
            <View style={styles.tags}>
              <Tag label={item.difficulty} />
            </View>
            {!!item.notes && (
              <Text style={text.body} numberOfLines={2}>
                {item.notes}
              </Text>
            )}
            {!!item.link && (
              <Button
                title="Open pattern"
                variant="ghost"
                onPress={() => Linking.openURL(item.link).catch(() => {})}
                style={{ alignSelf: 'flex-start', paddingHorizontal: 0, paddingVertical: 6 }}
              />
            )}
          </Card>
        )}
      />

      <Fab onPress={() => setEditing('new')} />

      <FormModal
        visible={editing !== null}
        title={editing === 'new' ? 'New pattern' : 'Edit pattern'}
        fields={fields}
        initialValues={initial}
        onSubmit={save}
        onClose={() => setEditing(null)}
        onDelete={
          editing && editing !== 'new'
            ? () => {
                remove('patterns', editing.id);
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
  search: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  tags: { flexDirection: 'row', marginVertical: 8 },
});
