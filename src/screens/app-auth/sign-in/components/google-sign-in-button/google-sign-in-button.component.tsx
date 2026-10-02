import React from 'react';
import {ActivityIndicator, Image, Pressable, Text, View} from 'react-native';
import {useStyles} from './google-sign-in-button.styles';

type Props = {
  label: string;
  busy: boolean;
  onPress: () => void;
};

export function GoogleSignInButton({label, busy, onPress}: Props) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: busy}}
      disabled={busy}
      onPress={onPress}
      style={({pressed}) => [styles.button, pressed && !busy && styles.pressed, busy && styles.busy]}>
      <View style={styles.content}>
        <Image
          // Official Google G: developers.google.com/static/identity/images/g-logo.png
          source={require('./google-g.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.label}>{label}</Text>
        {busy && <ActivityIndicator size="small" color="#1F1F1F" />}
      </View>
    </Pressable>
  );
}
