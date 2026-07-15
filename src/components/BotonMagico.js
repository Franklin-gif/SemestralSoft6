import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT, RADIUS, SHADOW } from '../theme/theme';

export const BotonMagico = ({ onPress, title, color = COLORS.primary, style }) => {
  const escala = useRef(new Animated.Value(1)).current;

  const alPresionarIn = () => {
    Animated.spring(escala, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const alPresionarOut = () => {
    Animated.spring(escala, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: escala }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={alPresionarIn}
        onPressOut={alPresionarOut}
        onPress={onPress}
        style={[styles.boton, { backgroundColor: color }]}
      >
        <Text style={styles.texto}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  boton: {
    minWidth: 180,
    minHeight: 88, // Estándar de accesibilidad infantil UI/UX
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    ...SHADOW.md,
  },
  texto: {
    color: COLORS.textoClaro,
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
  },
});