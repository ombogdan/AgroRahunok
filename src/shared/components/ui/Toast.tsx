import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {AccessibilityInfo, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';
import {AppIcon} from './AppIcon';

type ToastOptions = {text: string; actionLabel?: string; onAction?: () => void};
type ToastContextValue = {showToast: (options: ToastOptions) => void};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 6000;
// Height of the tab bar content above the home indicator, so the toast floats over it.
const TAB_BAR_CONTENT_HEIGHT = 49;

const createStyles = (theme: AppTheme) => ({
  wrap: {position: 'absolute' as const, left: 16, right: 16},
  // Inverted colours, as in the design: dark in the light theme and light in the dark one.
  toast: {minHeight: 60, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10,
    backgroundColor: theme.colors.text},
  text: {flex: 1, color: theme.colors.background, fontSize: 17, lineHeight: 22},
  action: {minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.background, justifyContent: 'center' as const},
  actionText: {color: theme.colors.background, fontSize: 17, fontWeight: '700' as const},
});

export function ToastProvider({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(options);
    AccessibilityInfo.announceForAccessibility(options.text);
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => hide, [hide]);

  const runAction = () => {
    const action = toast?.onAction;
    hide();
    action?.();
  };

  const value = useMemo(() => ({showToast}), [showToast]);
  const bottom = insets.bottom + TAB_BAR_CONTENT_HEIGHT + 12;

  return <ToastContext.Provider value={value}>
    {children}
    {toast && <View pointerEvents="box-none" style={[styles.wrap, {bottom}]}>
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <AppIcon name="check" color={theme.colors.background} size={22} />
        <Text style={styles.text}>{toast.text}</Text>
        {toast.actionLabel && <Pressable accessibilityRole="button" onPress={runAction} style={styles.action}>
          <Text style={styles.actionText}>{toast.actionLabel}</Text>
        </Pressable>}
      </View>
    </View>}
  </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
