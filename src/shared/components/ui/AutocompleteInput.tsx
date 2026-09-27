import React, {useState} from 'react';
import {Keyboard, Pressable, Text, TextInput, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

const createStyles = (theme: AppTheme) => ({
  input: {minHeight: 58, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: 19},
  inputOpen: {borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: theme.colors.primary},
  // The list sits in the flow under the field instead of floating, so it works inside any ScrollView.
  list: {borderWidth: 1, borderTopWidth: 0, borderColor: theme.colors.primary, borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12, backgroundColor: theme.colors.surface, overflow: 'hidden' as const},
  option: {minHeight: 48, paddingHorizontal: 16, justifyContent: 'center' as const},
  divider: {borderTopWidth: 1, borderTopColor: theme.colors.border},
  optionText: {color: theme.colors.text, fontSize: 17},
});

// A text field that offers values entered before; the caller decides which ones match.
export function AutocompleteInput({value, onChangeText, suggestions, placeholder, accessibilityLabel, maxLength = 60}: {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  accessibilityLabel?: string;
  maxLength?: number;
}) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const [focused, setFocused] = useState(false);
  const open = focused && suggestions.length > 0;

  return <View>
    <TextInput value={value} onChangeText={onChangeText} onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)} placeholder={placeholder} placeholderTextColor={theme.colors.textMuted}
      accessibilityLabel={accessibilityLabel} maxLength={maxLength} returnKeyType="done" autoCorrect={false}
      style={[styles.input, open && styles.inputOpen]} />
    {open && <View style={styles.list}>
      {suggestions.map((suggestion, index) => <Pressable key={suggestion} accessibilityRole="button"
        accessibilityHint="Підставити в поле" onPress={() => {
          onChangeText(suggestion);
          Keyboard.dismiss();
        }} style={[styles.option, index > 0 && styles.divider]}>
        <Text style={styles.optionText}>{suggestion}</Text>
      </Pressable>)}
    </View>}
  </View>;
}
