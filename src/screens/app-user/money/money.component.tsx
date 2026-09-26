import React from 'react';
import {EmptyFeature, Page} from '../../../shared/components/ui';

export function MoneyScreen() {
  return (
    <Page title="Гроші">
      <EmptyFeature
        icon="money"
        title="Підсумків ще немає"
        detail="Коли ви внесете витрати та продажі, тут з’являться доходи й результат сезону."
      />
    </Page>
  );
}
