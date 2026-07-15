// -----------------------------------------------------------------------------
// OndaVoz: barritas animadas tipo "ecualizador" que le muestran al niño (y a
// quien lo acompañe) que el micrófono está activo y escuchando de verdad.
//
// - Recibe `activo` (true mientras se está escuchando) y `nivel` (0 a 1).
// - En WEB el `nivel` es el volumen REAL del micrófono (ver
//   reconocimientoVoz.js, que usa AnalyserNode).
// - En NATIVO, react-native-voice no expone el volumen, así que la pantalla
//   que usa este componente le pasa un `nivel` simulado (aleatorio) mientras
//   `activo` es true — igual sirve como confirmación visual de que está
//   escuchando, aunque no sea 100% fiel al audio real.
// -----------------------------------------------------------------------------

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme/theme';

const NUM_BARRAS = 5;
const ALTURA_MIN = 6;
const ALTURA_MAX = 40;

export const OndaVoz = ({ activo, nivel = 0, color }) => {
  const alturas = useRef(
    Array.from({ length: NUM_BARRAS }, () => new Animated.Value(ALTURA_MIN))
  ).current;

  useEffect(() => {
    if (!activo) {
      alturas.forEach((valor) => {
        Animated.timing(valor, {
          toValue: ALTURA_MIN,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    alturas.forEach((valor) => {
      // Cada barra reacciona un poco distinto para que la onda se vea "viva"
      // en vez de todas las barras moviéndose exactamente igual.
      const variacion = 0.55 + Math.random() * 0.9;
      const alturaObjetivo = ALTURA_MIN + Math.min(1, nivel * variacion) * (ALTURA_MAX - ALTURA_MIN);
      Animated.timing(valor, {
        toValue: alturaObjetivo,
        duration: 120,
        useNativeDriver: false,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, activo]);

  const colorBarra = color || (activo ? COLORS.micActivo : COLORS.micInactivo);

  return (
    <View style={styles.contenedor} accessible accessibilityLabel={activo ? 'Escuchando' : 'Micrófono apagado'}>
      {alturas.map((valor, indice) => (
        <Animated.View
          key={indice}
          style={[styles.barra, { height: valor, backgroundColor: colorBarra }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: ALTURA_MAX,
    gap: 5,
    marginTop: 10,
    marginBottom: 4,
  },
  barra: {
    width: 7,
    borderRadius: RADIUS.sm,
  },
});

export default OndaVoz;