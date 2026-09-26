import React from 'react';
import {Text, View} from 'react-native';
import {AppIcon} from './AppIcon';
import type {AppIconName} from './AppIcon';
import {InfoCard} from './InfoCard';
import {useTheme, useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

const createStyles = (theme: AppTheme) => ({
  circle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  title: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  detail: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  content: {gap: 20, paddingVertical: 16},
});

export function EmptyFeature({
  icon,
  title,
  detail,
}: {
  icon: AppIconName;
  title: string;
  detail: string;
}) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  return (
    <InfoCard>
      <View style={styles.content}>
        <View style={styles.circle}><AppIcon name={icon} size={44} color={theme.colors.primary} /></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </InfoCard>
  );
}
