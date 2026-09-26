import React from 'react';
import {Text, View} from 'react-native';
import {AppButton, DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {demoJournal} from '../../../shared/data/demoFarm';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useScreenStyles} from '../screen.styles';

export function JournalScreen() {
  const navigation = useRootNavigation();
  const styles = useScreenStyles();
  return (
    <Page title="Журнал" subtitle="Усі роботи й збори за датою">
      <DemoBadge />
      <AppButton
        label="Новий запис"
        onPress={() => navigation.navigate('QuickEntry', {kind: 'work'})}
      />
      {demoJournal.map(item => (
        <InfoCard key={item.id}>
          <View style={styles.row}>
            <Text style={styles.body}>{item.title}</Text>
            <Text style={styles.label}>{item.date}</Text>
          </View>
          <Text style={styles.muted}>{item.field}</Text>
          <Text style={styles.pillText}>{item.amount}</Text>
        </InfoCard>
      ))}
    </Page>
  );
}
