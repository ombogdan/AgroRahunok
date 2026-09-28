import {t} from '../../../../shared/config/i18n';
import {useStyles} from './record-sheet.styles';
import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton, AppIcon} from '../../../../shared/components/ui';
import type {AppIconName} from '../../../../shared/components/ui/app-icon/app-icon.component';
import type {RecordKind} from '../../../../shared/core/records/model';
import {useScale, useTheme} from '../../../../shared/theme';

const options: {kind: RecordKind; title: string; detail: string; icon: AppIconName; ready: boolean}[] = [
  {kind: 'work', title: 'work', detail: 'workTypesSummary', icon: 'spade', ready: true},
  {kind: 'harvest', title: 'harvestRecord', detail: 'harvestUnitsSummary', icon: 'basket', ready: true},
  {kind: 'sale', title: 'sale', detail: 'quantityAndPrice', icon: 'cash', ready: true},
  {kind: 'other', title: 'otherExpenseOrIncome', detail: 'otherCostsSummary', icon: 'plusMinus', ready: true},
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
    <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={t("close")}>
      <Pressable style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, scale(20))}]} onPress={() => undefined}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t("whatWouldYouLikeToRecord")}</Text>
        {options.map(option => <Pressable key={option.kind} accessibilityRole="button" disabled={!option.ready}
          accessibilityState={{disabled: !option.ready}} onPress={() => onChoose(option.kind)}
          style={[styles.option, !option.ready && styles.disabled]}>
          <View style={styles.circle}><AppIcon name={option.icon} color={theme.colors.primary} size={26} /></View>
          <View style={styles.body}>
            <Text style={styles.optionTitle}>{t(option.title)}</Text>
            <Text style={styles.optionDetail}>{t(option.detail)}</Text>
          </View>
        </Pressable>)}
        <AppButton label={t("cancel")} variant="secondary" onPress={onClose} />
      </Pressable>
    </Pressable>
  </Modal>;
}
