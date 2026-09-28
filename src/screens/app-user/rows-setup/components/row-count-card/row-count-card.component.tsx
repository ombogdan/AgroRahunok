import {t} from '../../../../../shared/config/i18n';
import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {AppButton, InfoCard} from '../../../../../shared/components/ui';
import {useStyles} from './row-count-card.styles';

type Props = {
  count: number;
  value: string;
  onChange: (value: string) => void;
  canAdd: boolean;
  saving: boolean;
  onAdd: () => void;
  canRemoveLast?: boolean;
  onRemoveLast?: () => void;
};

export function RowCountCard({count, value, onChange, canAdd, saving, onAdd, canRemoveLast, onRemoveLast}: Props) {
  const styles = useStyles();
  return <InfoCard>
    <Text style={styles.title}>{count === 0 ? t("howManyRowsDoYouHave") : t("editNumberOfRows")}</Text>
    <Text style={styles.muted}>{count === 0
      ? t("rowSetupHint")
      : t("currentRowCountHint", [count])}</Text>
    <View style={styles.section}>
      <Text style={styles.label}>{count === 0 ? t("numberOfRows") : t("newTotalQuantity")}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="number-pad"
        placeholder={count === 0 ? t("forExample6") : t("forExample8")}
        accessibilityLabel={count === 0 ? t("numberOfRows") : t("newTotalNumberOfRows")}
        style={styles.input} />
      {value !== '' && !canAdd && <Text style={styles.error}>{t("enterANumberGreaterThan", [], "both")}{count}{t("maximum200", [], "after")}</Text>}
      <AppButton label={saving ? t("saving") : count === 0 ? t("createRows") : t("addRows")}
        disabled={!canAdd} onPress={onAdd} />
      {canRemoveLast && onRemoveLast && <AppButton label={t("removeEmptyRowLabel", [count])}
        variant="quiet" onPress={onRemoveLast} />}
    </View>
  </InfoCard>;
}
