import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './material-sheet.styles';
import React, {useState} from 'react';
import {
  InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton} from '../../../../../shared/components/ui';
import type {MaterialKind, MaterialUnit} from '../../../../../shared/core/records/model';
import {formatMoney, materialCostKopecks, materialKindLabels, materialUnitLabels} from '../../../../../shared/core/records/model';
import {useScale, useTheme} from '../../../../../shared/theme';
import {Chip} from '../../../components/record-chip/record-chip.component';
import type {MaterialDraft} from './material-draft';
import {parseDraft} from './material-draft';

// The sheet is its own window, so its number pads need their own «Готово» bar.
const KEYBOARD_BAR = 'material-sheet-keyboard-bar';
const units: MaterialUnit[] = ['kg', 't', 'l'];
const placeholders: Record<MaterialKind, string> = {
  seed: 'forExampleSeed', fertilizer: 'forExampleFertilizer', protection: 'forExampleProtection',
  other: 'forExampleOtherMaterial',
};

type Props = {
  initial: MaterialDraft;
  isNew: boolean;
  // The crop of this plot and season in the crop rotation, which new seed starts with.
  seedName: string;
  season: number;
  onCancel: () => void;
  onSave: (draft: MaterialDraft) => void;
  onDelete: () => void;
};

// One material in its own sheet with its own buttons, apart from the record's «Зберегти»:
// name, NPK for fertilisers only, the amount and the price per unit.
export function MaterialSheet({initial, isNew, seedName, season, onCancel, onSave, onDelete}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(initial);
  const {material, valid} = parseDraft(draft);
  const cost = material ? materialCostKopecks(material) : null;
  const unitLabel = t(materialUnitLabels[draft.unit]);
  const hint = draft.kind !== 'seed' ? null : !seedName ? t("seedNoRotationHint", [season])
    : draft.name.trim() === seedName ? t("seedFromRotation", [season]) : null;
  const numberProps = {
    keyboardType: 'decimal-pad' as const,
    inputAccessoryViewID: KEYBOARD_BAR,
    placeholderTextColor: theme.colors.textMuted,
  };

  return <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel={t("close")} />
      <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, scale(16))}]} accessibilityViewIsModal>
        <View style={styles.handle} />
        <Text style={styles.title} accessibilityRole="header">{t(materialKindLabels[draft.kind])}</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <TextInput value={draft.name} onChangeText={name => setDraft({...draft, name})} maxLength={80}
            placeholder={t(placeholders[draft.kind])} placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={t("name")} style={styles.input} />
          {hint ? <Text style={styles.note}>{hint}</Text> : null}
          {draft.kind === 'fertilizer' && <View style={styles.npk}>
            <Text style={styles.label}>{t("npkLabel")}</Text>
            <View style={styles.npkRow}>
              {(['n', 'p', 'k'] as const).map(part => <View key={part} style={styles.npkCell}>
                <Text style={styles.npkLetter}>{part.toUpperCase()}</Text>
                <TextInput {...numberProps} value={draft[part]} onChangeText={value => setDraft({...draft, [part]: value})}
                  placeholder="0" accessibilityLabel={`${part.toUpperCase()}, %`} style={[styles.input, styles.npkInput]} />
              </View>)}
            </View>
          </View>}
          <View style={styles.amountRow}>
            <TextInput {...numberProps} value={draft.quantity} onChangeText={quantity => setDraft({...draft, quantity})}
              placeholder={t("quantity")} accessibilityLabel={t("quantity")} style={[styles.input, styles.quantity]} />
            <View style={styles.units}>
              {units.map(unit => <Chip key={unit} label={t(materialUnitLabels[unit])} selected={draft.unit === unit}
                onPress={() => setDraft({...draft, unit})} />)}
            </View>
          </View>
          <View style={styles.priceField}>
            <TextInput {...numberProps} value={draft.price} onChangeText={price => setDraft({...draft, price})}
              placeholder={`${t("pricePer", [], "after")}${unitLabel}`}
              accessibilityLabel={`${t("pricePer", [], "after")}${unitLabel}`} style={styles.priceInput} />
            <Text style={styles.suffix}>{t("uah")}/{unitLabel}</Text>
          </View>
          {material && cost !== null && <View style={styles.calcLine}>
            <Text style={styles.calcText}>
              {draft.quantity.trim()} {unitLabel} × {formatMoney(material.pricePerUnitKopecks ?? 0)} = {formatMoney(cost)}
            </Text>
          </View>}
          {!valid && <Text style={styles.error}>{t("checkMaterialNumbers")}</Text>}
        </ScrollView>
        <View style={styles.buttons}>
          <View style={styles.button}><AppButton label={t("cancel")} variant="secondary" onPress={onCancel} /></View>
          <View style={styles.button}>
            <AppButton label={isNew ? t("addMaterialButton") : t("done")} disabled={!valid || !material}
              onPress={() => onSave(draft)} />
          </View>
        </View>
        {!isNew && <Pressable accessibilityRole="button" onPress={onDelete} style={styles.delete}>
          <Text style={styles.deleteText}>{t("removeMaterial")}</Text>
        </Pressable>}
      </View>
    </KeyboardAvoidingView>
    {Platform.OS === 'ios' && <InputAccessoryView nativeID={KEYBOARD_BAR}>
      <View style={styles.keyboardBar}>
        <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.keyboardDone}>
          <Text style={styles.keyboardDoneText}>{t("done")}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </Modal>;
}
