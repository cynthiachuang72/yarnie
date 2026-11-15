import React, { useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newId, useStore } from '../store';
import { Difficulty, Pattern } from '../types';
import { colors, radius, spacing } from '../theme';
import { Button, Card, EmptyState, Fab, Tag, text } from '../components/ui';
import { Field, FormModal, FormValues } from '../components/FormModal';
import { guessCraft, parsePatternText } from '../pattern';

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'intermediate', 'advanced'];

const fields: Field[] = [
  { key: 'name', label: 'Pattern name', type: 'text', placeholder: 'Classic ribbed beanie', required: true },
  { key: 'craft', label: 'Craft', type: 'choice', options: [{ label: '🧶 Knit', value: 'knit' }, { label: '🪝 Crochet', value: 'crochet' }] },
  { key: 'difficulty', label: 'Difficulty', type: 'choice', options: DIFFICULTIES.map((d) => ({ label: d, value: d })) },
  {
    key: 'stepsText',
    label: 'Repeating steps (one row per line)',
    type: 'multiline',
    placeholder: 'K3, *P2, K4 … P2, K3\nK5, *P4, K2 … K3\nRepeat 1\nRepeat 2',
  },
  { key: 'repeats', label: 'Work the steps how many times in total?', type: 'number', placeholder: '28' },
  { key: 'link', label: 'Link', type: 'text', placeholder: 'https://…' },
  { key: 'notes', label: 'Notes', type: 'multiline', placeholder: 'Gauge, hook/needle size, modifications…' },
];

export default function PatternsScreen() {
  const { state, add, update, remove } = useStore();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Pattern | 'new' | null>(null);
  const [prefill, setPrefill] = useState<FormValues>({});

  const openNew = (values: FormValues = {}) => {
    setPrefill(values);
    setEditing('new');
  };

  /** Read pattern text from the clipboard (e.g. copied from a photo with Live Text) into a new pattern. */
  const pastePattern = async () => {
    const clip = (await Clipboard.getStringAsync().catch(() => '')).trim();
    const { steps, repeats } = parsePatternText(clip);
    if (!steps.length) {
      Alert.alert(
        'Nothing to paste yet',
        'Copy your pattern first:\n\n1. Open the photo or screenshot in Photos.\n2. Press and hold on the text, then tap Select All → Copy.\n3. Come back and tap Paste pattern.',
      );
      return;
    }
    openNew({ stepsText: steps.join('\n'), repeats: repeats ?? '', craft: guessCraft(clip) ?? 'crochet' });
  };

  const q = query.trim().toLowerCase();
  const list = q
    ? state.patterns.filter((p) => `${p.name} ${p.notes} ${p.craft} ${(p.steps ?? []).join(' ')}`.toLowerCase().includes(q))
    : state.patterns;

  const initial: FormValues =
    editing && editing !== 'new'
      ? { ...editing, stepsText: (editing.steps ?? []).join('\n'), repeats: editing.repeats ?? '' }
      : { craft: 'crochet', difficulty: 'easy', link: '', notes: '', stepsText: '', repeats: '', ...prefill };

  const save = (v: FormValues) => {
    // Also tidies text pasted straight into the box: numbering and "Repeat N times" lines.
    const parsed = parsePatternText(String(v.stepsText ?? ''));
    const typedRepeats = Number(v.repeats) > 0 ? Math.round(Number(v.repeats)) : undefined;
    const data = {
      name: String(v.name).trim(),
      craft: v.craft,
      difficulty: v.difficulty,
      link: String(v.link ?? '').trim(),
      notes: v.notes ?? '',
      steps: parsed.steps,
      repeats: typedRepeats ?? parsed.repeats,
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
        <Button title="📋 Paste pattern" variant="secondary" onPress={pastePattern} style={{ marginTop: spacing.sm }} />
        <Text style={[text.muted, { textAlign: 'center', marginTop: 6 }]}>
          Copy text from a photo or screenshot (press and hold the text in Photos), then tap Paste.
        </Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState emoji="📖" title="Your pattern library is empty" hint="Tap Paste pattern or + to save a pattern you love." />
        }
        renderItem={({ item }) => (
          <Card onPress={() => setEditing(item)}>
            <Text style={text.h2}>
              {item.craft === 'knit' ? '🧶' : '🪝'} {item.name}
            </Text>
            <View style={styles.tags}>
              <Tag label={item.difficulty} />
              {!!item.steps?.length && (
                <Tag
                  label={`${item.steps.length} steps${item.repeats ? ` × ${item.repeats}` : ''}`}
                  color={colors.border}
                />
              )}
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

      <Fab onPress={() => openNew()} />

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
