import React, { useState, useContext, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { AUDIO_CATALOG } from '../utils/audioCatalog';
import { AventuraContext } from '../context/AventuraContext';
import { COLORS, FONT, SPACING, RADIUS, SHADOW } from '../theme/theme';

const { width } = Dimensions.get('window');

export const SelectorPerfilScreen = ({ navigation }) => {
  const contextoAventura = useContext(AventuraContext);
  const sonidoRef = useRef(null);

  const perfilActivo = contextoAventura?.perfilActivo;
  const cargandoPerfil = contextoAventura?.cargandoPerfil;

  // -----------------------------------------------------------------------
  // MÚSICA DE INTRO: solo debe sonar mientras esta pantalla está en foco.
  // useFocusEffect corre su cleanup cuando la pantalla pierde el foco
  // (por ejemplo al navegar a "MenuPrincipal" o a un nivel), a diferencia
  // de un useEffect normal que solo limpia al desmontarse (y con el stack
  // navigator esta pantalla no se desmonta al navegar, solo queda oculta).
  // -----------------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      let siguValida = true;

      const iniciarMusica = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(AUDIO_CATALOG.instrucciones.inicio);
          if (!siguValida) {
            // La pantalla perdió el foco mientras el audio cargaba: no reproducir
            await sound.unloadAsync();
            return;
          }
          sonidoRef.current = sound;
          await sound.setIsLoopingAsync(true);
          await sound.playAsync();
        } catch (error) {
          console.log('Error al cargar música en inicio:', error);
        }
      };

      iniciarMusica();

      // Se ejecuta al perder el foco (navegar a otra pantalla) o al desmontar
      return () => {
        siguValida = false;
        const sonidoActual = sonidoRef.current;
        sonidoRef.current = null;
        if (sonidoActual) {
          sonidoActual.stopAsync().catch(() => {});
          sonidoActual.unloadAsync().catch(() => {});
        }
      };
    }, [])
  );

  const manejarEntradaNino = () => {
    if (!perfilActivo) {
      const perfilPorDefecto = {
        nombre: 'Pequeño Aventurero',
        avatar: '👶',
        nivelesCompletados: [],
      };

      if (contextoAventura) {
        if (typeof contextoAventura.setPerfilActivo === 'function') {
          contextoAventura.setPerfilActivo(perfilPorDefecto);
        } else if (typeof contextoAventura.seleccionarPerfil === 'function') {
          contextoAventura.seleccionarPerfil(perfilPorDefecto);
        }
      }
    }

    // El mapa siempre abre como una nueva ra?z: evita pantallas duplicadas.
    navigation.reset({ index: 0, routes: [{ name: 'MenuPrincipal' }] });
  };

  const manejarCrearPerfil = () => {
    navigation.navigate('RegistroPerfil');
  };

  if (cargandoPerfil) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.decoracionArriba} />

      <View style={styles.ContenedorCuerpo}>
        <View style={styles.logoContenedor}>
          <Text style={styles.emojiLogo}>🦉🎨</Text>
        </View>

        <Text style={styles.tituloApp}>Mundo Colorín</Text>
        <Text style={styles.subtituloApp}>¡Una aventura llena de sonidos y colores!</Text>

        <TouchableOpacity style={styles.botonPrincipal} onPress={manejarEntradaNino}>
          <Text style={styles.iconoBoton}>🚀</Text>
          <View style={styles.contenedorTextoBoton}>
            <Text style={styles.textoBotonGrande} numberOfLines={1}>
              {perfilActivo ? `¡Jugar, ${perfilActivo.nombre}! ` : '¡Entrar a Jugar!'}
            </Text>
            <Text style={styles.textoBotonSub}>Modo Niños</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSecundario} onPress={manejarCrearPerfil}>
          <Text style={styles.textoBotonSecundario}>
            {perfilActivo ? `${perfilActivo.avatar} Cambiar Perfil` : '👶 Crear Perfil Nuevo'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decoracionAbajo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fondoAlterno, justifyContent: 'center', alignItems: 'center' },
  ContenedorCuerpo: { zIndex: 5, alignItems: 'center', width: '100%', paddingHorizontal: SPACING.lg },
  logoContenedor: { width: 130, height: 130, borderRadius: 65, backgroundColor: COLORS.superficie, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg, ...SHADOW.lg },
  emojiLogo: { fontSize: 60 },
  tituloApp: { fontSize: FONT.size.hero, fontWeight: FONT.weight.black, color: COLORS.primary, textAlign: 'center' },
  subtituloApp: { fontSize: FONT.size.md, color: COLORS.textoMuted, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xxl, fontWeight: FONT.weight.bold },
  botonPrincipal: { flexDirection: 'row', width: width * 0.8, paddingVertical: SPACING.lg, paddingHorizontal: 25, backgroundColor: COLORS.secondary, borderRadius: RADIUS.xl, alignItems: 'center', borderBottomWidth: 5, borderBottomColor: COLORS.secondaryDark, marginBottom: SPACING.lg, ...SHADOW.md },
  iconoBoton: { fontSize: 35, marginRight: SPACING.md },
  contenedorTextoBoton: { flex: 1, justifyContent: 'center' },
  textoBotonGrande: { fontSize: FONT.size.xl, fontWeight: FONT.weight.bold, color: COLORS.textoClaro },
  textoBotonSub: { fontSize: FONT.size.xs, color: COLORS.superficieExito, fontWeight: FONT.weight.bold, textTransform: 'uppercase' },
  botonSecundario: { width: width * 0.8, paddingVertical: SPACING.md, backgroundColor: COLORS.superficie, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.borde, alignItems: 'center', ...SHADOW.sm },
  textoBotonSecundario: { fontSize: FONT.size.md, fontWeight: FONT.weight.bold, color: COLORS.primary },
  decoracionArriba: { position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.primarySoft, opacity: 0.6 },
  decoracionAbajo: { position: 'absolute', bottom: -80, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: COLORS.primaryLight, opacity: 0.55 },
});

export default SelectorPerfilScreen;