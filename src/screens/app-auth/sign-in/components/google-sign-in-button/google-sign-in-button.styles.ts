import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

// Google's light button: white fill, gray outline, dark text, and the official full-color G.
const createStyles = (_theme: AppTheme, scale: Scale) => ({
  button: {
    minHeight: scale(56),
    borderRadius: scale(999),
    borderWidth: scale(1),
    borderColor: '#747775',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  pressed: {opacity: 0.88},
  busy: {opacity: 0.7},
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: scale(12),
  },
  logo: {width: scale(20), aspectRatio: 200 / 204},
  label: {
    color: '#1F1F1F',
    fontSize: scale(16),
    lineHeight: scale(22),
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    flexShrink: 1,
  },
});

export const useStyles = () => useThemedStyles(createStyles);
