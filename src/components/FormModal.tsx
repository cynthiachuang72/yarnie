import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Button } from './ui';

export type Field =
  | { key: string; label: string; type: 'text' | 'multiline'; placeholder?: string; required?: boolean }
  | { key: string; label: string; type: 'number'; placeholder?: string }
  | { key: string; label: string; type: 'choice'; options: { label: string; value: string | undefined }[] };

export type FormValues = Record<string, any>;

interface Props {
  visible: boolean;
  title: string;
  fields: Field[];
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
  onDelete?: () => void;
}

/** A reusable bottom-sheet form used for adding/editing projects, patterns and yarn. */
export function FormModal({ visible, title, fields, initialValues, onSubmit, onClose, onDelete }: Props) {
  const [values, setValues] = useState<FormValues>(initialValues);

  useEffect(() => {
    if (visible) setValues(initialValues);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: string, v: any) => setValues((prev) => ({ ...prev, [key]: v }));

  const missingRequired = fields.some(
    (f) => (f.type === 'text' || f.type === 'multiline') && f.required && !String(values[f.key] ?? '').trim(),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 480 }}>
            {fields.map((f) => (
              <View key={f.key} style={{ marginBottom: spacing.md }}>
                <Text style={styles.label}>{f.label}</Text>
                {f.type === 'choice' ? (
                  <View style={styles.choices}>
                    {f.options.map((o) => {
                      const selected = values[f.key] === o.value;
                      return (
                        <Pressable
                          key={o.label}
                          onPress={() => set(f.key, o.value)}
                          style={[styles.chip, selected && styles.chipSelected]}
                        >
                          <Text style={[styles.chipText, selected && { color: '#fff' }]}>{o.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={[styles.input, f.type === 'multiline' && { height: 90, textAlignVertical: 'top' }]}
                    value={values[f.key] === undefined ? '' : String(values[f.key])}
                    onChangeText={(t) => set(f.key, f.type === 'number' ? t.replace(/[^0-9.]/g, '') : t)}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.muted}
                    multiline={f.type === 'multiline'}
                    keyboardType={f.type === 'number' ? 'decimal-pad' : 'default'}
                  />
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            {onDelete ? <Button title="Delete" variant="ghost" onPress={onDelete} /> : <View />}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button title="Cancel" variant="ghost" onPress={onClose} />
              <Button
                title="Save"
                onPress={() => !missingRequired && onSubmit(values)}
                style={missingRequired ? { opacity: 0.5 } : undefined}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(61,44,46,0.35)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
});
