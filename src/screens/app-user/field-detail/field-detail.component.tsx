import React from 'react';
import {Alert, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, selectedAreaM2} from '../../../shared/core/fields/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useScreenStyles} from '../screen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

export function FieldDetailScreen({route, navigation}: Props) {
  const common = useScreenStyles();
  const {fields, removeField} = useFields();
  const field = fields.find(item => item.id === route.params.fieldId);

  if (!field) return <Page title="Ділянку не знайдено" onBack={() => navigation.goBack()} />;

  const confirmDelete = () => Alert.alert('Видалити ділянку?',
    `«${field.name}» буде видалено назавжди.`, [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Видалити', style: 'destructive', onPress: () => {
        removeField(field.id).then(() => navigation.goBack())
          .catch(error => {
            logSupabaseError('Не вдалося видалити ділянку', error);
            Alert.alert('Не вдалося видалити ділянку', 'Перевірте інтернет і спробуйте ще раз.');
          });
      }},
    ]);

  return <Page title={field.name} subtitle={`${fieldTypeLabels[field.type]} · ${formatArea(selectedAreaM2(field))}`} onBack={() => navigation.goBack()}>
    <InfoCard>
      <Text style={common.label}>Площа для розрахунків</Text>
      <Text style={common.metric}>{formatArea(selectedAreaM2(field))}</Text>
      {field.documentAreaM2 !== null && <Text style={common.muted}>За документами: {formatArea(field.documentAreaM2)}</Text>}
      {field.measuredAreaM2 !== null && <Text style={common.muted}>Виміряна на карті: {formatArea(field.measuredAreaM2)}</Text>}
    </InfoCard>
    {field.crop && <InfoCard>
      <Text style={common.label}>Культура цього сезону</Text>
      <Text style={common.sectionTitle}>{field.crop}</Text>
    </InfoCard>}
    <AppButton label="Видалити ділянку" variant="danger" onPress={confirmDelete} />
  </Page>;
}
