export type SubscriptionPlan = 'free' | 'plus';

export type FeatureId =
  | 'fields'
  | 'journal'
  | 'harvest'
  | 'sales'
  | 'basicAnalytics'
  | 'backup'
  | 'advancedAnalytics'
  | 'yieldForecast'
  | 'familySync';

const plusFeatures: ReadonlySet<FeatureId> = new Set([
  'advancedAnalytics',
  'yieldForecast',
  'familySync',
]);

export function canUseFeature(
  plan: SubscriptionPlan,
  feature: FeatureId,
): boolean {
  return plan === 'plus' || !plusFeatures.has(feature);
}
