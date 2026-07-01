import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export const BotonMagico = ({ onPress, title, color = '#2E75B6', style }) => {
  // Usamos useRef para mantener la misma instancia de animación entre renders
  const escala = useRef(new Animated.Value(1)).current;

  const alPresionarIn = () => {
    Animated.spring(escala, { 
      toValue: 0.95, 
      useNativeDriver: true 
    }).start();
  };

  const alPresionarOut = () => {
    Animated.spring(escala, { 
      toValue: 1, 
      useNativeDriver: true 
    }).start();
  };

  return (
    // CORRECCIÓN AQUÍ: Se mapea explícitamente el nombre de la propiedad de transformación 'scale' 
    // con el valor de la variable animada 'escala'.
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
    minHeight: 88, // Estándar de accesibilidad infantil UI/UX del documento base [cite: 483]
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  texto: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});