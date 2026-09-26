import React from 'react';
import {EmptyFeature, Page} from '../../../shared/components/ui';

export function FieldsScreen() {
  return (
    <Page title="Ділянки">
      <EmptyFeature
        icon="plots"
        title="Ділянок ще немає"
        detail="Тут з’являться ваша земля, площа й культури. Додавання ділянки — наступний функціональний крок."
      />
    </Page>
  );
}
