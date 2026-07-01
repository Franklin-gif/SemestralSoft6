import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import { BotonMagico } from '../components/BotonMagico';
import estructuraNiveles from '../data/niveles.json';

const FRASES_ALIENTO = [
  "¡Buen intento! Vamos a mirar juntos. ✨",
  "Casi lo logras, ¡lo estás haciendo genial! 🌟",
  "Probemos otra vez juntos, ¡cada intento te ayuda a aprender! 💪",
  "¡Qué buen esfuerzo! Mira esta pequeña ayuda. 🧭"
];

export const MotorJuegoScreen = ({ route, navigation }) => {
  const { nivelId } = route.params;
  const { completarNivel, registrarIntentoPedagogico } = useContext(AventuraContext);

  const nivelActual = estructuraNiveles.niveles.find(n => n.id === nivelId);
  
  const [actividadIndex, setActividadIndex] = useState(0);
  const [pasoExplicacion, setPasoExplicacion] = useState(false);
  const [mostrarPistaVisual, setMostrarPistaVisual] = useState(false);
  const [bocadilloTexto, setBocadilloTexto] = useState("");
  const [nivelTerminado, setNivelTerminado] = useState(false); // Nuevo estado para la celebración
  
  const actividad = nivelActual?.actividades[actividadIndex];
  const opacidadMascota = useState(new Animated.Value(1))[0];
  const escalaCelebracion = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (actividad) {
      setBocadilloTexto(actividad.pregunta);
      setMostrarPistaVisual(false);
      setPasoExplicacion(false);
    }
  }, [actividadIndex, nivelId]);

  // Lanzar animación de estrellitas cuando el nivel finalice
  useEffect(() => {
    if (nivelTerminado) {
      Animated.spring(escalaCelebracion, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      }).start();
    }
  }, [nivelTerminado]);

  if (!actividad) return null;

  const manejarRespuesta = (opcion) => {
    if (opcion.esCorrecta) {
      registrarIntentoPedagogico(nivelActual.titulo, true);
      setBocadilloTexto("¡Excelente! 🎉 ¡Lo descubriste!");
      
      setTimeout(() => {
        if (actividadIndex + 1 < nivelActual.actividades.length) {
          setActividadIndex(actividadIndex + 1);
        } else {
          // Guardar el progreso de forma permanente en el contexto
          completarNivel(nivelActual.id, 15, nivelActual.recompensaIcono);
          setNivelTerminado(true);
        }
      }, 1800);

    } else {
      registrarIntentoPedagogico(nivelActual.titulo, false);
      setPasoExplicacion(true);
      
      const fraseAleatoria = FRASES_ALIENTO[Math.floor(Math.random() * FRASES_ALIENTO.length)];
      setBocadilloTexto(`${fraseAleatoria}\n\n💡 ${opcion.pista}`);

      Animated.sequence([
        Animated.timing(opacidadMascota, { toValue: 0.4, duration: 200, useNativeDriver: true }),
        Animated.timing(opacidadMascota, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();

      setTimeout(() => {
        setPasoExplicacion(false);
        setMostrarPistaVisual(true);
        setBocadilloTexto(`¡Intentémoslo otra vez! Mira con atención la ayuda brillante.`);
      }, 4200);
    }
  };

  // PANTALLA DE CELEBRACIÓN DE ESTRELLAS (Diseño nativo interactivo)
  if (nivelTerminado) {
    return (
      <View style={styles.contenedorCelebracion}>
        <Animated.View style={[styles.tarjetaCelebracion, { transform: [{ scale: escalaCelebracion }] }]}>
          <Text style={styles.emojiGranPremio}>🏆</Text>
          <Text style={styles.tituloCelebracion}>¡Nivel Superado!</Text>
          <Text style={styles.subCelebracion}>Encendiste una nueva luz brillante en el bosque mágico.</Text>
          
          <View style={styles.contenedorEstrellasGanadas}>
            <Text style={styles.estrellaGrande}>⭐</Text>
            <Text style={styles.textoEstrellasMas}>+15 Estrellas</Text>
          </View>

          <Text style={styles.ganasteInsignia}>Ganaste una medalla: {nivelActual.recompensaIcono}</Text>

          <BotonMagico 
            title="Volver a Inicio" 
            color="#4CAF50" 
            onPress={() => navigation.navigate('MenuPrincipal')} 
          />
        </Animated.View>
      </View>
    );
  }

  // Verificar si las opciones tienen textos largos (como "¡Sí! 👍") para achicar la tarjeta
  const esActividadDeTextoCorto = actividad.opciones?.some(o => o.contenido.length > 2);

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerProgreso}>
        <Text style={styles.textoProgreso}>Prueba {actividadIndex + 1} de {nivelActual.actividades.length}</Text>
        <View style={styles.barraFondo}>
          <View style={[styles.barraRelleno, { width: `${((actividadIndex + 1) / nivelActual.actividades.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.areaGuia}>
        <Animated.View style={[styles.mascotaAvatar, { opacity: opacidadMascota }]}>
          <Text style={styles.emojiMascota}>🦉</Text>
          <Text style={styles.nombreMascota}>Lumi</Text>
        </Animated.View>
        <View style={styles.bocadillo}>
          <Text style={styles.textoBocadillo}>{bocadilloTexto}</Text>
        </View>
      </View>

      {/* Grid de opciones adaptativo */}
      <View style={[styles.gridOpciones, esActividadDeTextoCorto && styles.gridHorizontalFijo]}>
        {actividad.opciones?.map((opcion) => {
          const esLaCorrectaYSeMuestraPista = mostrarPistaVisual && opcion.esCorrecta;

          return (
            <TouchableOpacity
              key={opcion.id}
              disabled={pasoExplicacion}
              onPress={() => manejarRespuesta(opcion)}
              style={[
                styles.tarjetaOpcion,
                esActividadDeTextoCorto ? styles.tarjetaTextoAncho : styles.tarjetaCuadradaNormal,
                pasoExplicacion && styles.tarjetaDeshabilitada,
                esLaCorrectaYSeMuestraPista && styles.resplandorPista
              ]}
            >
              <Text style={[styles.emojiContenido, esActividadDeTextoCorto && styles.textoBotonReducido]}>
                {opcion.contenido}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F4F9F4', padding: 20, justifyContent: 'space-between' },
  headerProgreso: { marginTop: 30, alignItems: 'center' },
  textoProgreso: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  barraFondo: { width: '90%', height: 16, backgroundColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' },
  barraRelleno: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 8 },
  areaGuia: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, paddingHorizontal: 10 },
  mascotaAvatar: { alignItems: 'center', marginRight: 12 },
  emojiMascota: { fontSize: 44 },
  nombreMascota: { fontSize: 12, fontWeight: 'bold', color: '#2E75B6' },
  bocadillo: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#C8E6C9', minHeight: 90, justifyContent: 'center' },
  textoBocadillo: { fontSize: 17, color: '#333', textAlign: 'center', fontWeight: '500' },
  
  // Estilos del Layout de Botones
  gridOpciones: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 30 },
  gridHorizontalFijo: { flexDirection: 'row', flexWrap: 'nowrap', width: '100%', paddingHorizontal: 10 },
  tarjetaOpcion: { backgroundColor: '#FFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 2, borderColor: '#EBF4FA' },
  tarjetaCuadradaNormal: { width: 120, height: 120 },
  tarjetaTextoAncho: { flex: 1, height: 80, borderRadius: 20, paddingHorizontal: 10 },
  tarjetaDeshabilitada: { opacity: 0.5 },
  resplandorPista: { borderWidth: 4, borderColor: '#FFD166', backgroundColor: '#FFFDE7' },
  emojiContenido: { fontSize: 50, textAlign: 'center' },
  textoBotonReducido: { fontSize: 22, fontWeight: 'bold', color: '#2E75B6' },

  // Estilos de la Pantalla de Celebración Avanzada
  contenedorCelebracion: { flex: 1, backgroundColor: 'rgba(27, 54, 93, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  tarjetaCelebracion: { width: '90%', backgroundColor: '#FFF', borderRadius: 32, padding: 24, alignItems: 'center', borderBottomWidth: 8, borderColor: '#EBF4FA', elevation: 10 },
  emojiGranPremio: { fontSize: 70, marginBottom: 10 },
  tituloCelebracion: { fontSize: 28, fontWeight: 'bold', color: '#1B365D', textAlign: 'center' },
  subCelebracion: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 10 },
  contenedorEstrellasGanadas: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, marginVertical: 20, borderWidth: 1, borderColor: '#FFE082' },
  estrellaGrande: { fontSize: 32, marginRight: 10 },
  textoEstrellasMas: { fontSize: 24, fontWeight: 'bold', color: '#E8722C' },
  ganasteInsignia: { fontSize: 16, fontWeight: '600', color: '#4CAF50', marginBottom: 24 }
});