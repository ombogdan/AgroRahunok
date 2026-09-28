import {localeTag, t} from '../../../config/i18n';
import React, {useEffect, useRef, useState} from 'react';
import {Modal, Platform, Pressable, Text, View} from 'react-native';
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fromLocalIsoDate, toLocalIsoDate} from '../../../core/records/model';
import {useScale, useTheme} from '../../../theme';
import {AppButton} from '../app-button/app-button.component';
import {useStyles} from './calendar-date-picker.styles';

// Records are about work already done, so the calendar runs from 2000 up to today;
// plans such as the crop rotation may reach into the future.
const FIRST_DATE = new Date(2000, 0, 1);
const LAST_PLANNED_DATE = new Date(2100, 11, 31);

type Props = {
  visible: boolean;
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  onClose: () => void;
  allowFuture?: boolean;
};

const lastDate = (allowFuture?: boolean) => (allowFuture ? LAST_PLANNED_DATE : new Date());

// The phone's own date picker: the calendar dialog on Android, the inline calendar in a bottom sheet on iOS.
export function CalendarDatePicker(props: Props) {
  return Platform.OS === 'android' ? <AndroidDatePicker {...props} /> : <IosDatePicker {...props} />;
}

function AndroidDatePicker({visible, selectedDate, onSelect, onClose, allowFuture}: Props) {
  // The dialog opens once per `visible`; the latest callbacks are read when it closes.
  const latest = useRef({selectedDate, onSelect, onClose, allowFuture});
  useEffect(() => {
    latest.current = {selectedDate, onSelect, onClose, allowFuture};
  });

  useEffect(() => {
    if (!visible) return;
    DateTimePickerAndroid.open({
      value: fromLocalIsoDate(latest.current.selectedDate),
      mode: 'date',
      minimumDate: FIRST_DATE,
      maximumDate: lastDate(latest.current.allowFuture),
      onValueChange: (_, date) => latest.current.onSelect(toLocalIsoDate(date)),
      onDismiss: () => latest.current.onClose(),
    });
    return () => {
      DateTimePickerAndroid.dismiss('date').catch(() => undefined);
    };
  }, [visible]);

  return null;
}

function IosDatePicker({visible, selectedDate, onSelect, onClose, allowFuture}: Props) {
  const styles = useStyles();
  const {theme, isDark} = useTheme();
  const scale = useScale();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(() => fromLocalIsoDate(selectedDate));

  // Each opening starts from the date already chosen in the form.
  useEffect(() => {
    if (visible) setDraft(fromLocalIsoDate(selectedDate));
  }, [visible, selectedDate]);

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t("closeCalendar")} />
      <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, scale(20))}]} accessibilityViewIsModal>
        <View style={styles.handle} />
        <Text style={styles.title}>{t("chooseADate")}</Text>
        <DateTimePicker
          style={styles.picker}
          value={draft}
          mode="date"
          display="inline"
          locale={localeTag()}
          themeVariant={isDark ? 'dark' : 'light'}
          accentColor={theme.colors.primary}
          minimumDate={FIRST_DATE}
          maximumDate={lastDate(allowFuture)}
          onValueChange={(_, date) => setDraft(date)} />
        <View style={styles.buttons}>
          <View style={styles.button}>
            <AppButton label={t("cancel")} variant="secondary" onPress={onClose} />
          </View>
          <View style={styles.button}>
            <AppButton label={t("done")} onPress={() => onSelect(toLocalIsoDate(draft))} />
          </View>
        </View>
      </View>
    </View>
  </Modal>;
}
