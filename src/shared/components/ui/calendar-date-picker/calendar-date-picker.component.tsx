import React, {useEffect, useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fromLocalIsoDate, toLocalIsoDate} from '../../../core/records/model';
import {useStyles} from './calendar-date-picker.styles';

const months = ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень',
  'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'];
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

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
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Закрити календар" />
      <View style={styles.card} accessibilityViewIsModal>
        <View style={styles.heading}>
          <Text style={styles.title}>Оберіть дату</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Закрити календар"
            onPress={onClose} style={styles.close}><Text style={styles.closeText}>✕</Text></Pressable>
        </View>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Попередній місяць"
            onPress={() => changeMonth(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
          <Text style={styles.month}>{months[month.getMonth()]} {month.getFullYear()}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Наступний місяць"
            onPress={() => changeMonth(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
        </View>
        <View style={styles.yearRow}>
          <Pressable accessibilityRole="button" onPress={() => changeMonth(-12)} style={styles.yearButton}>
            <Text style={styles.yearText}>− Рік</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => changeMonth(12)} style={styles.yearButton}>
            <Text style={styles.yearText}>+ Рік</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {weekdays.map(day => <View key={day} style={styles.dayCell}><Text style={styles.weekday}>{day}</Text></View>)}
          {cells.map((day, index) => {
            if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const isoDate = toLocalIsoDate(new Date(month.getFullYear(), month.getMonth(), day));
            const selected = isoDate === selectedDate;
            return <View key={isoDate} style={styles.dayCell}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${day} ${months[month.getMonth()]} ${month.getFullYear()}`}
                accessibilityState={{selected}} onPress={() => onSelect(isoDate)}
                style={[styles.dayButton, selected && styles.daySelected]}>
                <Text style={[styles.dayText, selected && styles.daySelectedText]}>{day}</Text>
              </Pressable>
            </View>;
          })}
        </View>
        <Pressable accessibilityRole="button" onPress={() => onSelect(today)} style={styles.todayButton}>
          <Text style={styles.todayText}>Сьогодні</Text>
        </Pressable>
      </View>
    </View>
  </Modal>;
}
