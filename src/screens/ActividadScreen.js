import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from '../theme/theme';
import dataActividades from '../data/actividades.json';

export const ActividadScreen = ({ navigation }) => {
  const { agregarEstrella, desbloquearRecompensa } = useContext(AppContext);
  const actividad = dataActividades.colores_1; // Carga estática de ejemplo
  
  // Estados del ciclo interactivo de 4 pasos
  const [pasoExplicacion, setPasoExplicacion] = useState(false);
  const [mensajeGuia, setMensajeGuia] = useState(actividad.preguntaTexto);
  const [intentoFallido, setIntentoFallido] = useState(false);

  const manejarRespuesta = (opcion) => {
    if (opcion.esCorrecta) {
      // Paso 4: Celebración idéntica e incremento de estrellas
      agregarEstrella(5);
      desbloquearRecompensa('sol_feliz');
      Alert.alert("¡Increíble!", "¡Lo has logrado! Recibiste un Sol Feliz.", [
        { text: "Continuar", onPress: () => navigation.navigate('MenuPrincipal') }
      ]);
    } else {
      // Paso 2: Redirección sin frustración -> Micro-explicación interactiva
      setIntentoFallido(true);
      setPasoExplicacion(true);
      setMensajeGuia(opcion.pista || "¡Casi! Vamos a verlo juntos.");
      
      // Simula reproducción de audio/animación pedagógica explicativa de 4 segundos
      setTimeout(() => {
        setPasoExplicacion(false);
        setMensajeGuia("¡Inténtalo otra vez! Mira la pequeña ayuda brillante."); // Paso 3: Reintento con ayuda visual
      }, 4000);
    }
  };

  return (
    <View style={styles.contenedor}>
      {/* Cabecera de Progreso */}
      <View style={styles.header}>
        <Text style={styles.tituloApp}>Mundo Colorín</Text>
        <View style={styles.barraProgreso} />
      </View>

      {/* Mascota y bocadillo de texto interactivo */}
      <View style={styles.contenedorGuia}>
        <Text style={styles.bocadilloTexto}>{mensajeGuia}</Text>
      </View>

      {/* Grid de opciones de la Actividad */}
      <View style={styles.gridOpciones}>
        {actividad.opciones.map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            disabled={pasoExplicacion}
            style={[
              styles.tarjetaOpcion,
              pasoExplicacion && styles.tarjetaDeshabilitada,
              intentoFallido && opcion.esCorrecta && styles.pistaResplandor // Brillo de ayuda visual
            ]}
            onPress={() => manejarRespuesta(opcion)}
          >
            {/* Aquí irían las imágenes del JSON. Usamos bloques de color simulados */}
            <View style={[styles.bloqueImagen, { backgroundColor: opcion.esCorrecta ? COLORS.error : COLORS.primary }]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.fondo, padding: SPACING.lg, justifyContent: 'space-around' },
  header: { alignItems: 'center' },
  tituloApp: { fontSize: FONT.size.xl, fontWeight: FONT.weight.bold, color: COLORS.primary },
  barraProgreso: { width: '80%', height: 12, backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, marginTop: SPACING.sm },
  contenedorGuia: { backgroundColor: COLORS.superficie, padding: SPACING.lg, borderRadius: RADIUS.md, borderBottomLeftRadius: 0, marginHorizontal: SPACING.lg, borderWidth: 2, borderColor: COLORS.bordeSuave, ...SHADOW.sm },
  bocadilloTexto: { fontSize: FONT.size.lg, textAlign: 'center', color: COLORS.texto },
  gridOpciones: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.lg },
  tarjetaOpcion: { width: 140, height: 140, backgroundColor: COLORS.superficie, borderRadius: RADIUS.lg, padding: SPACING.sm, justifyContent: 'center', alignItems: 'center', ...SHADOW.md },
  tarjetaDeshabilitada: { opacity: 0.6 },
  pistaResplandor: { borderWidth: 4, borderColor: COLORS.accent },
  bloqueImagen: { width: 100, height: 100, borderRadius: RADIUS.sm }
});