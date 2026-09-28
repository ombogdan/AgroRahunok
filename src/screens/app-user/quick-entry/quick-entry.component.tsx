import {t} from '../../../shared/config/i18n';
import React, {useState} from 'react';
import {Alert, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {EntryKind, RootStackParamList} from '../../../navigation/types';
import {AppButton, DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {useScreenStyles} from '../screen.styles';
import {useStyles} from './quick-entry.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickEntry'>;

const labels: Record<EntryKind, string> = {
  work: 'work',
  harvest: 'harvestWork',
  sale: 'sale',
};

export function QuickEntryScreen({route}: Props) {
  const [kind, setKind] = useState<EntryKind>(route.params?.kind || 'work');
  const [amount, setAmount] = useState('');
  const styles = useStyles();
  const common = useScreenStyles();
  const amountLabel = kind === 'work' ? t("costUah") : kind === 'harvest' ? t("quantity") : t("saleAmountUah");

  return (
    <Page title={t("quickEntry")} subtitle={t("previewOfQuickEntryInAFewTaps")} withHeader>
      <DemoBadge />
      <Text style={common.sectionTitle}>{t("whatAreYouRecording")}</Text>
      <View style={styles.choices}>
        {(['work', 'harvest', 'sale'] as const).map(option => (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => {
              setKind(option);
              setAmount('');
            }}
            style={[styles.choice, kind === option && styles.choiceActive]}>
            <Text style={styles.choiceText}>{t(labels[option])}</Text>
          </Pressable>
        ))}
      </View>
      <InfoCard>
        <Text style={common.label}>{t("fieldLabel")}</Text>
        <Text style={common.body}>{kind === 'work' ? t("wheatField") : t("raspberryPlot")}</Text>
        <Text style={common.label}>{t("date")}</Text>
        <Text style={common.body}>{t("today")}</Text>
        <Text style={common.label}>{amountLabel}</Text>
        <TextInput
          accessibilityLabel={amountLabel}
          keyboardType="decimal-pad"
          placeholder={kind === 'harvest' ? t("forExample3Buckets") : t("enterAmount")}
          placeholderTextColor="#809187"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />
        <AppButton
          label={t("preview")}
          onPress={() =>
            Alert.alert(
              t("sampleEntry"),
              t("recordSavingUnavailableNotice", [t(labels[kind]), amount || t('notSpecified')]),
            )
          }
        />
      </InfoCard>
      <Text style={common.muted}>{t("quickEntryPrefillHint", [], "both")}</Text>
    </Page>
  );
}
