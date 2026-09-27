import {useStyles} from './record-sheet.styles';
import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton, AppIcon} from '../../../../shared/components/ui';
import type {AppIconName} from '../../../../shared/components/ui/app-icon/app-icon.component';
import type {RecordKind} from '../../../../shared/core/records/model';
import {useScale, useTheme} from '../../../../shared/theme';

const options: {kind: RecordKind; title: string; detail: string; icon: AppIconName; ready: boolean}[] = [
  {kind: 'work', title: 'Робота', detail: 'Оранка, посів, сапання…', icon: 'spade', ready: true},
  {kind: 'harvest', title: 'Збір урожаю', detail: 'Кг, центнери, відра…', icon: 'basket', ready: true},
  {kind: 'sale', title: 'Продаж', detail: 'Кількість і ціна', icon: 'cash', ready: true},
  {kind: 'other', title: 'Інша витрата чи дохід', detail: 'Податок, тара, ремонт…', icon: 'plusMinus', ready: true},
];


// «Що записати?» bottom sheet from the design.
export function RecordSheet({visible, onClose, onChoose}: {
  visible: boolean;
  onClose: () => void;
  onChoose: (kind: RecordKind) => void;
}) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Закрити">
      <Pressable style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, scale(20))}]} onPress={() => undefined}>
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
