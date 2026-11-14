import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newId, useStore } from '../store';
import { Yarn, YarnWeight } from '../types';
import { colors, radius, spacing } from '../theme';
import { Card, EmptyState, Fab, Tag, text } from '../components/ui';
import { Field, FormModal, FormValues } from '../components/FormModal';

const WEIGHTS: YarnWeight[] = ['lace', 'fingering', 'sport', 'DK', 'worsted', 'bulky', 'super bulky'];

const fields: Field[] = [
  { key: 'name', label: 'Brand / yarn line', type: 'text', placeholder: 'Merino Soft', required: true },
  { key: 'color', label: 'Colorway', type: 'text', placeholder: 'Dusty rose', required: true },
  { key: 'weight', label: 'Weight', type: 'choice', options: WEIGHTS.map((w) => ({ label: w, value: w })) },
  { key: 'fiber', label: 'Fiber', type: 'text', placeholder: '100% merino wool' },
  { key: 'skeins', label: 'Skeins on hand', type: 'number', placeholder: '3' },
];

export default function StashScreen() {
  const { state, add, update, remove } = useStore();
  const [editing, setEditing] = useState<Yarn | 'new' | null>(null);

  const totalSkeins = state.yarns.reduce((sum, y) => sum + (y.skeins || 0), 0);

  const initial: FormValues =
    editing && editing !== 'new' ? editing : { weight: 'worsted', fiber: '', skeins: 1 };

  const save = (v: FormValues) => {
    const data = {
      name: String(v.name).trim(),
      color: String(v.color).trim(),
      weight: v.weight,
      fiber: String(v.fiber ?? '').trim(),
      skeins: Number(v.skeins) || 0,
    };
    if (editing === 'new') add('yarns', { ...data, id: newId(), createdAt: Date.now() });
    else if (editing) update('yarns', editing.id, data);
    setEditing(null);
  };

  const adjust = (y: Yarn, delta: number) => update('yarns', y.id, { skeins: Math.max(0, y.skeins + delta) });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={text.h1}>Yarn stash</Text>
        <Text style={[text.muted, { marginTop: 4 }]}>
          {state.yarns.length} yarns · {totalSkeins} skeins
        </Text>
      </View>

      <FlatList
        data={state.yarns}
        keyExtractor={(y) => y.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState emoji="🧺" title="No yarn yet" hint="Tap + to add yarn to your stash." />}
        renderItem={({ item }) => (
          <Card onPress={() => setEditing(item)} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={text.h2}>{item.name}</Text>
              <Text style={text.body}>{item.color}</Text>
              <View style={styles.tags}>
                <Tag label={item.weight} color={colors.secondary} />
                {!!item.fiber && <Tag label={item.fiber} color={colors.border} />}
              </View>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => adjust(item, -1)} style={styles.step} hitSlop={8}>
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.count}>{item.skeins}</Text>
              <Pressable onPress={() => adjust(item, 1)} style={styles.step} hitSlop={8}>
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />

      <Fab onPress={() => setEditing('new')} />

      <FormModal
        visible={editing !== null}
        title={editing === 'new' ? 'Add yarn' : 'Edit yarn'}
        fields={fields}
        initialValues={initial}
        onSubmit={save}
        onClose={() => setEditing(null)}
        onDelete={
          editing && editing !== 'new'
            ? () => {
                remove('yarns', editing.id);
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
  row: { flexDirection: 'row', alignItems: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  stepper: { alignItems: 'center', marginLeft: spacing.md },
  step: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, fontWeight: '700', color: colors.text },
  count: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginVertical: 4 },
});
