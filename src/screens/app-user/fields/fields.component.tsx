import {t} from '../../../shared/config/i18n';
import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {AppButton, AppIcon, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, selectedAreaM2} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {currentRows, varietyGroups} from '../../../shared/core/rows/model';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  label: {color: theme.colors.textMuted, fontSize: scale(17), fontWeight: '600' as const},
  total: {color: theme.colors.text, fontSize: scale(38), fontWeight: '700' as const},
  emptyTitle: {color: theme.colors.text, fontSize: scale(22), fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24)},
  row: {minHeight: scale(72), flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12)},
  rowBody: {flex: 1, gap: scale(3)},
  name: {color: theme.colors.text, fontSize: scale(19), fontWeight: '600' as const},
  area: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export function FieldsScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {fields, loadState, reload} = useFields();
  const {data} = useFarmData();
  const totalM2 = fields.reduce((sum, field) => sum + selectedAreaM2(field), 0);

  return <Page title={t("fields")} subtitle={t("yourLandAndItsArea")}>
    {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
    {loadState === 'error' && <InfoCard>
      <Text style={styles.emptyTitle}>{t("couldNotLoadFields")}</Text>
      <Text style={styles.muted}>{t("couldNotOpenDataOnThePhoneRestartTheApp")}</Text>
      <AppButton label={t("tryAgain")} onPress={reload} />
    </InfoCard>}
    {loadState === 'ready' && <>
      {fields.length > 0 && <InfoCard>
        <Text style={styles.label}>{t("totalLand")}</Text>
        <Text style={styles.total}>{formatHectares(totalM2)}</Text>
      </InfoCard>}
      {fields.length === 0 && <InfoCard>
        <Text style={styles.emptyTitle}>{t("noFieldsYet")}</Text>
        <Text style={styles.muted}>{t("addFirstFieldDescription")}</Text>
      </InfoCard>}
      {fields.map(field => <Pressable key={field.id} accessibilityRole="button"
        onPress={() => navigation.navigate('FieldDetail', {fieldId: field.id})}>
        <InfoCard>
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{field.name}</Text>
              <Text style={styles.muted}>{[t(fieldTypeLabels[field.type]), field.crop,
                currentRows(data.rows, field.id).length > 0
                  ? varietyGroups(currentRows(data.rows, field.id)).map(group => group.variety).join(', ')
                  : field.variety].filter(Boolean).join(' · ')}</Text>
            </View>
            <Text style={styles.area}>{formatArea(selectedAreaM2(field))}</Text>
            <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
          </View>
        </InfoCard>
      </Pressable>)}
      {/* With plots, «+ Додати ділянку» sits in the dock above the tabs. */}
      {fields.length === 0 && <AppButton label={t("addField")} onPress={() => navigation.navigate('FieldMethod')} />}
    </>}
  </Page>;
}
