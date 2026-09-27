import {useStyles} from './toast.styles';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {AccessibilityInfo, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useScale, useTheme} from '../../../theme';
import {AppIcon} from '../app-icon/app-icon.component';

type ToastOptions = {text: string; actionLabel?: string; onAction?: () => void};
type ToastContextValue = {showToast: (options: ToastOptions) => void};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 4000;


export function ToastProvider({children}: PropsWithChildren) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
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
  const top = insets.top + scale(12);

  return <ToastContext.Provider value={value}>
    {children}
    {toast && <View pointerEvents="box-none" style={[styles.wrap, {top}]}>
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <AppIcon name="check" color={theme.colors.background} size={22} />
        <Text style={styles.text}>{toast.text}</Text>
        {toast.actionLabel && <Pressable accessibilityRole="button" onPress={runAction} style={styles.action}>
          <Text style={styles.actionText}>{toast.actionLabel}</Text>
        </Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel="Закрити повідомлення" onPress={hide}
          style={styles.close}><Text style={styles.closeText}>✕</Text></Pressable>
      </View>
    </View>}
  </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
