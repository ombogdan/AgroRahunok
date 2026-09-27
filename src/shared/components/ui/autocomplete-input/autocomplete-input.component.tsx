import {useStyles} from './autocomplete-input.styles';
import React, {useState} from 'react';
import {Keyboard, Pressable, Text, TextInput, View} from 'react-native';
import {useTheme} from '../../../theme';


// A text field that offers values entered before; the caller decides which ones match.
export function AutocompleteInput({value, onChangeText, suggestions, placeholder, accessibilityLabel, maxLength = 60}: {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  accessibilityLabel?: string;
  maxLength?: number;
}) {
  const styles = useStyles();
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
