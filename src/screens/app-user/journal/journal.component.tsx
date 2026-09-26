import React from 'react';
import {EmptyFeature, Page} from '../../../shared/components/ui';

export function JournalScreen() {
  return (
    <Page title="Журнал">
      <EmptyFeature
        icon="journal"
        title="Записів ще немає"
        detail="Роботи, збори врожаю й продажі будуть тут у порядку дат."
      />
    </Page>
  );
}
