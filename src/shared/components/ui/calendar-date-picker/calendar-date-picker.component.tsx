import {localeTag, t} from '../../../config/i18n';
import React, {useEffect, useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fromLocalIsoDate, toLocalIsoDate} from '../../../core/records/model';
import {useStyles} from './calendar-date-picker.styles';

const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

type Props = {
  visible: boolean;
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  onClose: () => void;
};

export function CalendarDatePicker({visible, selectedDate, onSelect, onClose}: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => {
    const selected = fromLocalIsoDate(selectedDate);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  useEffect(() => {
    if (!visible) return;
    const selected = fromLocalIsoDate(selectedDate);
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selectedDate, visible]);

  const firstWeekday = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7}, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const changeMonth = (delta: number) => setMonth(current => {
    const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    return next.getFullYear() >= 2000 && next.getFullYear() <= 2100 ? next : current;
  });
  const today = toLocalIsoDate(new Date());

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.overlay, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t("closeCalendar")} />
      <View style={styles.card} accessibilityViewIsModal>
        <View style={styles.heading}>
          <Text style={styles.title}>{t("chooseADate")}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("closeCalendar")}
            onPress={onClose} style={styles.close}><Text style={styles.closeText}>✕</Text></Pressable>
        </View>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("previousMonth")}
            onPress={() => changeMonth(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
          <Text style={styles.month}>{new Intl.DateTimeFormat(localeTag(), {month: 'long', year: 'numeric'}).format(month)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("nextMonth")}
            onPress={() => changeMonth(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
        </View>
        <View style={styles.yearRow}>
          <Pressable accessibilityRole="button" onPress={() => changeMonth(-12)} style={styles.yearButton}>
            <Text style={styles.yearText}>{t("previousYear")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => changeMonth(12)} style={styles.yearButton}>
            <Text style={styles.yearText}>{t("nextYear")}</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {weekdays.map(day => <View key={day} style={styles.dayCell}><Text style={styles.weekday}>{t(day)}</Text></View>)}
          {cells.map((day, index) => {
            if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const isoDate = toLocalIsoDate(new Date(month.getFullYear(), month.getMonth(), day));
            const selected = isoDate === selectedDate;
            return <View key={isoDate} style={styles.dayCell}>
              <Pressable accessibilityRole="button" accessibilityLabel={new Intl.DateTimeFormat(localeTag(), {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(month.getFullYear(), month.getMonth(), day))}
                accessibilityState={{selected}} onPress={() => onSelect(isoDate)}
                style={[styles.dayButton, selected && styles.daySelected]}>
                <Text style={[styles.dayText, selected && styles.daySelectedText]}>{day}</Text>
              </Pressable>
            </View>;
          })}
        </View>
        <Pressable accessibilityRole="button" onPress={() => onSelect(today)} style={styles.todayButton}>
          <Text style={styles.todayText}>{t("today")}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>;
}
