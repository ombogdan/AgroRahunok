import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton, AppIcon} from '../../../shared/components/ui';
import type {AppIconName} from '../../../shared/components/ui/AppIcon';
import type {RecordKind} from '../../../shared/core/records/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const options: {kind: RecordKind; title: string; detail: string; icon: AppIconName; ready: boolean}[] = [
  {kind: 'work', title: 'Робота', detail: 'Оранка, посів, сапання…', icon: 'spade', ready: true},
  {kind: 'harvest', title: 'Збір урожаю', detail: 'Незабаром', icon: 'basket', ready: false},
  {kind: 'sale', title: 'Продаж', detail: 'Незабаром', icon: 'cash', ready: false},
  {kind: 'other', title: 'Інша витрата чи дохід', detail: 'Незабаром', icon: 'plusMinus', ready: false},
];

const createStyles = (theme: AppTheme) => ({
  scrim: {flex: 1, backgroundColor: theme.colors.scrim, justifyContent: 'flex-end' as const},
  sheet: {backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingHorizontal: 20, gap: 12},
  handle: {alignSelf: 'center' as const, width: 40, height: 5, borderRadius: 3, backgroundColor: theme.colors.border},
  title: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const, marginTop: 8},
  option: {minHeight: 76, borderRadius: 20, paddingHorizontal: 14, flexDirection: 'row' as const,
    alignItems: 'center' as const, gap: 14, backgroundColor: theme.colors.background},
  disabled: {opacity: 0.45},
  circle: {width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  body: {flex: 1, gap: 2},
  optionTitle: {color: theme.colors.text, fontSize: 19, fontWeight: '600' as const},
  optionDetail: {color: theme.colors.textMuted, fontSize: 15},
});

// «Що записати?» bottom sheet from the design; only work records exist so far.
export function RecordSheet({visible, onClose, onChoose}: {
  visible: boolean;
  onClose: () => void;
  onChoose: (kind: RecordKind) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Закрити">
      <Pressable style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 20)}]} onPress={() => undefined}>
        <View style={styles.handle} />
        <Text style={styles.title}>Що записати?</Text>
        {options.map(option => <Pressable key={option.kind} accessibilityRole="button" disabled={!option.ready}
          accessibilityState={{disabled: !option.ready}} onPress={() => onChoose(option.kind)}
          style={[styles.option, !option.ready && styles.disabled]}>
          <View style={styles.circle}><AppIcon name={option.icon} color={theme.colors.primary} size={26} /></View>
          <View style={styles.body}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDetail}>{option.detail}</Text>
          </View>
        </Pressable>)}
        <AppButton label="Скасувати" variant="secondary" onPress={onClose} />
      </Pressable>
    </Pressable>
  </Modal>;
}
