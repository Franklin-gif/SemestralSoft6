import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { crearControladorVoz } from '../utils/reconocimientoVoz';
import { AUDIO_CATALOG } from '../utils/audioCatalog';
import { AventuraContext } from '../context/AventuraContext';
import estructuraNiveles from '../data/niveles.json';
import { COLORS, FONT, SPACING, RADIUS, SHADOW, obtenerColorTematico } from '../theme/theme';
import { OndaVoz } from '../components/OndaVoz';

const { width } = Dimensions.get('window');

// -----------------------------------------------------------------------------
// TABLA DE VALIDACIÓN POR COLOR (azul / rojo / amarillo)
// -----------------------------------------------------------------------------
// Aquí se define, para CADA color del pre-nivel, qué palabras cuentan como
// respuesta correcta cuando la transcripción de voz llega. Si el niño dice
// cualquiera de estas variantes, se acepta como acierto para ese color.
// Fácil de ampliar si el reconocimiento falla con acentos regionales.
// -----------------------------------------------------------------------------
const SINONIMOS_COLOR = {
  azul: ['azul', 'asul'],
  rojo: ['rojo', 'roho', 'rrojo'],
  amarillo: ['amarillo', 'amario', 'amarilyo'],
};

// Quita tildes, pasa a minúsculas y limpia espacios para comparar de forma justa
const normalizarTexto = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// true si la frase dicha contiene alguna variante válida del color esperado
const validarColorDicho = (fraseDicha, colorEsperado) => {
  const fraseNormalizada = normalizarTexto(fraseDicha);
  const variantesValidas = SINONIMOS_COLOR[colorEsperado] || [colorEsperado];
  return variantesValidas.some((variante) => fraseNormalizada.includes(normalizarTexto(variante)));
};

export const MotorJuegoScreen = ({ route, navigation }) => {
  const { colorNivel, esPreNivel, nivelId } = route.params || {
    colorNivel: 'azul',
    esPreNivel: false,
    nivelId: 'pre_nivel',
  };
  const { perfilActivo, setPerfilActivo } = useContext(AventuraContext);

  // Estados reactivos
  const [colorActual, setColorActual] = useState(colorNivel);
  const [modoPreNivel, setModoPreNivel] = useState(esPreNivel);
  const [sound, setSound] = useState(null);

  // Control de audio e interactividad (Pre-Nivel con voz)
  const [audioReproduciendo, setAudioReproduciendo] = useState(true);
  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const [textoReconocido, setTextoReconocido] = useState('');
  const [mostrarValidacion, setMostrarValidacion] = useState(false);
  const procesandoResultado = useRef(false);

  // Nivel de audio del micrófono (0 a 1), para dibujar la onda de voz.
  // - En web es el nivel REAL del micrófono (viene de reconocimientoVoz.js).
  // - En nativo se simula con un intervalo mientras estaEscuchando es true,
  //   ver el useEffect más abajo.
  const [nivelAudio, setNivelAudio] = useState(0);

  // Controlador de voz (se crea una sola vez por pantalla activa)
  const controladorVozRef = useRef(null);

  // Control de progreso para Niveles de Aventura
  const [actividadIndex, setActividadIndex] = useState(0);

  // Estado para la ventana de felicitación lúdica personalizada
  const [modalVisible, setModalVisible] = useState(false);
  const [datosModal, setDatosModal] = useState({ titulo: '', msg: '', tipo: 'exito', icono: '🎉', accion: null });

  // Buscar datos correspondientes en el JSON
  const datosNivelJson = estructuraNiveles.niveles.find((n) => n.id === (nivelId || 'pre_nivel'));
  const actividadActual = datosNivelJson?.actividades?.[actividadIndex];

  // Referencia siempre actualizada al color actual, para usarla dentro de los callbacks de voz
  const colorActualRef = useRef(colorActual);
  useEffect(() => {
    colorActualRef.current = colorActual;
  }, [colorActual]);

  // Configuración del controlador de voz (Web Speech API en web; nativo en
  // development build; deshabilitado con aviso en Expo Go)
  useEffect(() => {
    controladorVozRef.current = crearControladorVoz({
      onInicio: () => setEstaEscuchando(true),
      onFin: () => setEstaEscuchando(false),
      onError: (mensaje) => {
        console.log('Error de reconocimiento de voz:', mensaje);
        setEstaEscuchando(false);
      },
      onResultado: (texto) => manejarResultadosVoz(texto),
      // Solo tiene efecto en web (nivel real del micrófono). En nativo se ignora.
      onVolumen: (nivel) => setNivelAudio(nivel),
    });

    return () => {
      if (controladorVozRef.current) {
        controladorVozRef.current.destruir();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // En nativo no tenemos el nivel real del micrófono (react-native-voice no
  // lo expone), así que simulamos una onda mientras se está escuchando, solo
  // para dar la confirmación visual de "el micrófono está activo".
  useEffect(() => {
    if (Platform.OS === 'web') return undefined; // en web el nivel es real

    let intervalId = null;
    if (estaEscuchando) {
      intervalId = setInterval(() => {
        setNivelAudio(0.35 + Math.random() * 0.65);
      }, 150);
    } else {
      setNivelAudio(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [estaEscuchando]);

  // Procesa lo que el niño dijo de manera asíncrona
  const manejarResultadosVoz = (transcripcionCruda) => {
    if (!transcripcionCruda) {
      if (procesandoResultado.current) return;
      procesandoResultado.current = true;
      setTextoReconocido('');
      setMostrarValidacion(true);
      responderColor('');
      return;
    }

    if (procesandoResultado.current) return;
    procesandoResultado.current = true;
    const transcripcionCompleta = transcripcionCruda.toLowerCase().trim();
    setTextoReconocido(transcripcionCompleta);
    setMostrarValidacion(true);

    evaluarVozDirecta(transcripcionCompleta);
  };

  // Valida contra la tabla de sinónimos: acepta azul / rojo / amarillo (y variantes)
  const evaluarVozDirecta = (fraseDicha) => {
    const esCorrecto = validarColorDicho(fraseDicha, colorActualRef.current);
    responderColor(esCorrecto ? colorActualRef.current : fraseDicha);
  };

  // Determinar color de fondo temático infantil para la aventura libre
  const obtenerFondoAventura = () => {
    if (nivelId === 'nivel_1') return COLORS.primarySoft;
    if (nivelId === 'nivel_2') return COLORS.primaryLight;
    return COLORS.fondo;
  };

  useFocusEffect(
    useCallback(() => {
      const colorInicial = route.params?.colorNivel || 'azul';
      const modoInicial = route.params?.esPreNivel || false;

      setColorActual(colorInicial);
      setModoPreNivel(modoInicial);
      setMostrarValidacion(false);
      setTextoReconocido('');
      setModalVisible(false);
      setActividadIndex(0);

      if (modoInicial) {
        reproducirInstruccion(colorInicial);
      }

      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params])
  );

  const reproducirInstruccion = async (colorAProcesar) => {
    try {
      setAudioReproduciendo(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: soundInstance } = await Audio.Sound.createAsync(
        AUDIO_CATALOG.instrucciones[colorAProcesar]
      );

      setSound(soundInstance);

      soundInstance.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setAudioReproduciendo(false);
        }
      });

      await soundInstance.playAsync();
    } catch (error) {
      console.log(`Error cargando audio del color ${colorAProcesar}:`, error);
      setAudioReproduciendo(false);
    }
  };

  const reproducirAudioManual = () => {
    if (!audioReproduciendo) {
      reproducirInstruccion(colorActual);
    }
  };

  // Activa el reconocimiento de voz (Web Speech API en web, nativo en dev build)
  const alternarMicrofono = async () => {
    if (!controladorVozRef.current) return;

    if (estaEscuchando) {
      try {
        await controladorVozRef.current.detener();
      } catch (error) {
        console.log('Error al detener grabación:', error);
      }
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const permiso = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: 'Permiso de micrófono',
          message: 'Mundo Colorín necesita el micrófono para escuchar el color que dices.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Ahora no',
        });
        if (permiso !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Micrófono necesario', 'Activa el permiso de micrófono para poder responder hablando.');
          return;
        }
      }

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
        // Esto solo es para validar el permiso antes de arrancar. El stream
        // real que se usa para la onda de voz lo abre reconocimientoVoz.js
        // por su cuenta, así que aquí cerramos este de inmediato para no
        // dejar el micrófono abierto dos veces.
        try {
          const streamDePrueba = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamDePrueba.getTracks().forEach((track) => track.stop());
        } catch (permisoError) {
          Alert.alert('Micrófono necesario', 'Debes permitir el acceso al micrófono en el navegador.');
          return;
        }
      }

      if (sound) {
        await sound.stopAsync();
        setAudioReproduciendo(false);
      }
      procesandoResultado.current = false;
      setTextoReconocido('');
      setMostrarValidacion(false);
      await controladorVozRef.current.iniciar();
    } catch (error) {
      console.log('Error al arrancar grabación:', error);
      setEstaEscuchando(false);
      Alert.alert('No pudimos activar el micrófono', 'Inténtalo otra vez y revisa los permisos del dispositivo/navegador.');
    }
  };

  const procesarFinPreNivel = () => {
    setModalVisible(false);
    if (perfilActivo && setPerfilActivo) {
      const actualizados = [...(perfilActivo.nivelesCompletados || [])];
      if (!actualizados.includes('pre_nivel')) {
        actualizados.push('pre_nivel');
      }
      setPerfilActivo({ ...perfilActivo, nivelesCompletados: actualizados });
    }
    navigation.navigate('MenuPrincipal');
  };

  const manejarSeleccionOpcion = (opcion) => {
    if (opcion.esCorrecta) {
      const esUltimaActividad = actividadIndex === (datosNivelJson?.actividades?.length - 1);

      setDatosModal({
        titulo: '¡Magnífico! 🌟',
        msg: esUltimaActividad
          ? `¡Ganaste la medalla de "${datosNivelJson.titulo}"! Sos un genio. 🏆`
          : '¡Lo hiciste genial! Vamos por el que sigue. 🚀',
        icono: '👑',
        accion: () => {
          setModalVisible(false);
          if (esUltimaActividad) {
            if (perfilActivo && setPerfilActivo) {
              const actualizados = [...(perfilActivo.nivelesCompletados || [])];
              if (!actualizados.includes(nivelId)) {
                actualizados.push(nivelId);
              }
              setPerfilActivo({ ...perfilActivo, nivelesCompletados: actualizados });
            }
            navigation.navigate('MenuPrincipal');
          } else {
            setActividadIndex((prev) => prev + 1);
          }
        },
      });
      setModalVisible(true);
    } else {
      setDatosModal({
        titulo: '¡Casi, intenta otra vez! ✨',
        msg: opcion.pista || '¡Mira bien los dibujos e inténtalo de nuevo!',
        icono: '💡',
        accion: () => setModalVisible(false),
      });
      setModalVisible(true);
    }
  };

  const responderColor = (colorSeleccionado) => {
    if (colorSeleccionado === colorActualRef.current) {
      if (modoPreNivel) {
        if (colorActualRef.current === 'azul') {
          setDatosModal({
            titulo: '¡Excelente!',
            msg: '¡Muy bien hecho! Ahora pasamos al color ROJO ❤️',
            icono: '✨🔵',
            accion: () => {
              setModalVisible(false);
              setMostrarValidacion(false);
              setTextoReconocido('');
              setColorActual('rojo');
              reproducirInstruccion('rojo');
            },
          });
          setModalVisible(true);
        } else if (colorActualRef.current === 'rojo') {
          setDatosModal({
            titulo: '¡Genial!',
            msg: '¡Perfecto! Vamos al último color de la lección: AMARILLO 💛',
            icono: '🔥❤️',
            accion: () => {
              setModalVisible(false);
              setMostrarValidacion(false);
              setTextoReconocido('');
              setColorActual('amarillo');
              reproducirInstruccion('amarillo');
            },
          });
          setModalVisible(true);
        } else if (colorActualRef.current === 'amarillo') {
          setDatosModal({
            titulo: '¡Felicidades!',
            msg: 'Has completado todo el Pre-Nivel. ¡Los mundos del mapa ya están listos! 🏆',
            icono: '🦉👑',
            accion: () => {
              setMostrarValidacion(false);
              procesarFinPreNivel();
            },
          });
          setModalVisible(true);
        }
      }
    } else {
      setDatosModal({
        titulo: '¡Casi!',
        msg:
          colorSeleccionado.trim() === ''
            ? 'No pudimos escuchar nada claro. ¡Asegúrate de hablar cerca del micrófono! ✨'
            : `Escuchamos algo como "${colorSeleccionado.toUpperCase()}". ¡Vamos a oírlo otra vez para recordar cómo suena! ✨`,
        icono: '🧐',
        accion: () => {
          setModalVisible(false);
          setMostrarValidacion(false);
          setTextoReconocido('');
          reproducirInstruccion(colorActualRef.current);
        },
      });
      setModalVisible(true);
    }
  };

  // BOTÓN NUEVO: vuelve al selector de niveles, deteniendo audio y micrófono antes
  const manejarVolverAMapa = async () => {
    try {
      if (estaEscuchando && controladorVozRef.current) {
        await controladorVozRef.current.detener();
      }
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.log('Error al detener audio/voz antes de volver:', error);
    }
    navigation.navigate('MenuPrincipal');
  };

  const colorTematicoOscuro = obtenerColorTematico(colorActual, 'oscuro');
  const colorTematicoClaro = obtenerColorTematico(colorActual, 'claro');

  return (
    <View style={[styles.container, !modoPreNivel && { backgroundColor: obtenerFondoAventura() }]}>
      {/* Modal Única para Mensajes y Feedback */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <Text style={styles.modalIcono}>{datosModal.icono}</Text>
            <Text style={styles.modalTitulo}>{datosModal.titulo}</Text>
            <Text style={styles.modalMensaje}>{datosModal.msg}</Text>
            <TouchableOpacity style={styles.modalBoton} onPress={datosModal.accion}>
              <Text style={styles.modalBotonTexto}>Continuar Aventura 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BARRA SUPERIOR: botón para volver al selector de niveles */}
      <View style={styles.barraSuperior}>
        <TouchableOpacity style={styles.botonVolver} onPress={manejarVolverAMapa}>
          <Text style={styles.textoBotonVolver}>⬅️ Niveles</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.pruebaTexto}>{modoPreNivel ? 'Aprendiendo Colores' : 'Modo: Aventura Libre'}</Text>

      {modoPreNivel ? (
        <>
          <View style={styles.contenedorTituloPre}>
            <Text style={[styles.titulo, { color: colorTematicoOscuro }]}>
              Color: {colorActual.toUpperCase()}
            </Text>

            <TouchableOpacity
              style={[styles.botonRepetir, audioReproduciendo && styles.botonRepetirApagado]}
              onPress={reproducirAudioManual}
              disabled={audioReproduciendo}
            >
              <Text style={styles.textoBotonRepetir}>🔊 Escuchar otra vez</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.circuloColor, { backgroundColor: colorTematicoClaro }]} />

          <TouchableOpacity
            style={[
              styles.botonMic,
              estaEscuchando && styles.botonMicActivo,
              audioReproduciendo && styles.botonMicInactivo,
            ]}
            onPress={alternarMicrofono}
          >
            <Text style={styles.textoBoton}>
              {audioReproduciendo
                ? '🎙️ Toca para responder'
                : estaEscuchando
                ? '🛑 ¡Te escucho! Presiona para parar'
                : '🎙️ Presiona para Hablar'}
            </Text>
          </TouchableOpacity>

          {/* Onda de voz: confirma visualmente que el micrófono está activo/escuchando */}
          <OndaVoz activo={estaEscuchando} nivel={nivelAudio} color={colorTematicoOscuro} />

          {textoReconocido.length > 0 && (
            <Text style={styles.textoFeedback}>Escuchado: "{textoReconocido}"</Text>
          )}
        </>
      ) : (
        <View style={styles.contenedorAventura}>
          <Text style={styles.tituloAventura}>{datosNivelJson?.titulo}</Text>
          <Text style={styles.progresoTexto}>
            Pregunta {actividadIndex + 1} de {datosNivelJson?.actividades?.length} ✨
          </Text>

          <View style={styles.cardActividad}>
            <Text style={styles.preguntaTexto}>{actividadActual?.pregunta}</Text>

            <View style={styles.opcionesGrid}>
              {actividadActual?.opciones?.map((opcion) => (
                <TouchableOpacity
                  key={opcion.id}
                  style={styles.botonOpcionAventuraGigante}
                  onPress={() => manejarSeleccionOpcion(opcion)}
                >
                  <Text style={styles.textoOpcionAventuraGigante}>{opcion.contenido}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fondo, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },

  barraSuperior: { position: 'absolute', top: 44, left: SPACING.md, zIndex: 10 },
  botonVolver: {
    backgroundColor: COLORS.peligro,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.peligroOscuro,
    ...SHADOW.sm,
  },
  textoBotonVolver: { color: COLORS.textoClaro, fontWeight: FONT.weight.bold, fontSize: FONT.size.sm },

  pruebaTexto: {
    fontSize: FONT.size.xs,
    color: COLORS.textoMuted,
    textTransform: 'uppercase',
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    marginTop: 34,
  },
  titulo: { fontSize: FONT.size.display, fontWeight: FONT.weight.black },
  contenedorTituloPre: { alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.xs },
  botonRepetir: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    ...SHADOW.sm,
  },
  botonRepetirApagado: { backgroundColor: COLORS.micDeshabilitado, opacity: 0.6 },
  textoBotonRepetir: { color: COLORS.textoClaro, fontWeight: FONT.weight.bold, fontSize: FONT.size.sm },
  circuloColor: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: SPACING.xl,
    borderWidth: 4,
    borderColor: COLORS.superficie,
    ...SHADOW.lg,
  },
  botonMic: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.micInactivo,
    borderRadius: RADIUS.pill,
    minWidth: 270,
    alignItems: 'center',
    ...SHADOW.md,
  },
  botonMicActivo: { backgroundColor: COLORS.micActivo },
  botonMicInactivo: { backgroundColor: COLORS.micDeshabilitado, opacity: 0.8 },
  textoBoton: { color: COLORS.textoClaro, fontWeight: FONT.weight.bold, fontSize: FONT.size.md, textAlign: 'center' },
  textoFeedback: {
    marginTop: SPACING.lg,
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    color: COLORS.textoSecundario,
    fontWeight: FONT.weight.regular,
  },

  contenedorAventura: { width: '100%', alignItems: 'center', paddingHorizontal: SPACING.xs },
  tituloAventura: {
    fontSize: FONT.size.display,
    fontWeight: FONT.weight.black,
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  progresoTexto: {
    fontSize: FONT.size.md,
    color: COLORS.textoSecundario,
    marginBottom: SPACING.md,
    fontWeight: FONT.weight.bold,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  cardActividad: {
    width: '100%',
    backgroundColor: COLORS.superficie,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.bordeSuave,
    ...SHADOW.lg,
  },
  preguntaTexto: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.black,
    color: COLORS.texto,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 32,
  },
  opcionesGrid: { width: '100%', gap: SPACING.md },

  botonOpcionAventuraGigante: {
    width: '100%',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.fondoAlterno,
    borderRadius: RADIUS.xl,
    borderWidth: 3,
    borderColor: COLORS.borde,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.deshabilitado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoOpcionAventuraGigante: { fontSize: FONT.size.display, fontWeight: FONT.weight.bold },

  modalFondo: { flex: 1, backgroundColor: COLORS.superposicion, justifyContent: 'center', alignItems: 'center' },
  modalContenedor: {
    width: width * 0.85,
    backgroundColor: COLORS.superficie,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOW.lg,
  },
  modalIcono: { fontSize: 55, marginBottom: SPACING.md },
  modalTitulo: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.black,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMensaje: {
    fontSize: FONT.size.md,
    color: COLORS.textoSecundario,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
    fontWeight: FONT.weight.regular,
  },
  modalBoton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.secondaryDark,
    width: '100%',
    alignItems: 'center',
  },
  modalBotonTexto: { color: COLORS.textoClaro, fontSize: FONT.size.lg, fontWeight: FONT.weight.bold },
});

export default MotorJuegoScreen;