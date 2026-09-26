import React, {createContext, useContext, useMemo} from 'react';
import type {PropsWithChildren} from 'react';
import {canUseFeature} from '../../services/subscription/entitlements';
import type {
  FeatureId,
  SubscriptionPlan,
} from '../../services/subscription/entitlements';

type SubscriptionContextValue = {
  plan: SubscriptionPlan;
  canUse: (feature: FeatureId) => boolean;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({children}: PropsWithChildren) {
  // Every feature in the first release is free. The billing adapter comes later.
  const value = useMemo<SubscriptionContextValue>(
    () => ({plan: 'free', canUse: feature => canUseFeature('free', feature)}),
    [],
  );
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) {
    throw new Error('useSubscription must be used inside SubscriptionProvider');
  }
  return value;
}
