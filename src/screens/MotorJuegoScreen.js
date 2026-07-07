// src/screens/MotorJuegoScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { AUDIO_CATALOG } from '../utils/audioCatalog';
import { AventuraContext } from '../context/AventuraContext';

const { width } = Dimensions.get('window');

export const MotorJuegoScreen = ({ route, navigation }) => {
  const { colorNivel, esPreNivel } = route.params || { colorNivel: "azul", esPreNivel: false }; 
  const { perfilActivo, setPerfilActivo } = useContext(AventuraContext);
  
  // Estados reactivos
  const [colorActual, setColorActual] = useState(colorNivel);
  const [modoPreNivel, setModoPreNivel] = useState(esPreNivel);
  const [sound, setSound] = useState(null);
  
  // Control de audio e interactividad
  const [audioReproduciendo, setAudioReproduciendo] = useState(true);
  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const [textoReconocido, setTextoReconocido] = useState('');
  const [mostrarValidacion, setMostrarValidacion] = useState(false);

  // Estado para la ventana de felicitación lúdica personalizada
  const [modalVisible, setModalVisible] = useState(false);
  const [datosModal, setDatosModal] = useState({ titulo: '', msg: '', tipo: 'exito', icono: '🎉', accion: null });

  useFocusEffect(
    useCallback(() => {
      const colorInicial = route.params?.colorNivel || "azul";
      const modoInicial = route.params?.esPreNivel || false;

      setColorActual(colorInicial);
      setModoPreNivel(modoInicial);
      setMostrarValidacion(false);
      setTextoReconocido('');
      setModalVisible(false);

      reproducirInstruccion(colorInicial);

      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [route.params])
  );

  const reproducirInstruccion = async (colorAProcesar) => {
    try {
      setAudioReproduciendo(true); // 🔒 Bloqueamos micrófono
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: soundInstance } = await Audio.Sound.createAsync(
        AUDIO_CATALOG.instrucciones[colorAProcesar]
      );
      
      setSound(soundInstance);

      // Monitoreamos el estado físico del audio nativo
      soundInstance.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setAudioReproduciendo(false); // 🔓 Desbloqueamos cuando termina el audio
        }
      });

      await soundInstance.playAsync();
    } catch (error) {
      console.log(`Error cargando audio del color ${colorAProcesar}:`, error);
      setAudioReproduciendo(false); // Liberación de emergencia en fallos
    }
  };

  const alternarMicrofono = () => {
    if (audioReproduciendo || estaEscuchando) return;

    setEstaEscuchando(true);
    setTextoReconocido('Escuchando...');
    setMostrarValidacion(false);

    setTimeout(() => {
      setEstaEscuchando(false);
      setMostrarValidacion(true);
      setTextoReconocido('¡Voz capturada! Evalúa la respuesta:');
    }, 2000);
  };

  const procesarFinPreNivel = () => {
    setModalVisible(false);
    // 🎯 Guardamos el avance del pre_nivel en el perfil global para romper candados
    if (perfilActivo && setPerfilActivo) {
      const actualizados = [...(perfilActivo.nivelesCompletados || [])];
      if (!actualizados.includes('pre_nivel')) {
        actualizados.push('pre_nivel');
      }
      setPerfilActivo({ ...perfilActivo, nivelesCompletados: actualizados });
    }
    navigation.navigate('MenuPrincipal');
  };

  const responderColor = (colorSeleccionado) => {
    setMostrarValidacion(false);
    setTextoReconocido(colorSeleccionado);

    if (colorSeleccionado === colorActual) {
      if (modoPreNivel) {
        if (colorActual === "azul") {
          setDatosModal({
            titulo: "¡Excelente!",
            msg: "¡Muy bien hecho! Ahora pasamos al color ROJO ❤️",
            icono: "✨🔵",
            accion: () => {
              setModalVisible(false);
              setColorActual("rojo");
              reproducirInstruccion("rojo");
            }
          });
          setModalVisible(true);
        } else if (colorActual === "rojo") {
          setDatosModal({
            titulo: "¡Genial!",
            msg: "¡Perfecto! Vamos al último color de la lección: AMARILLO 💛",
            icono: "🔥❤️",
            accion: () => {
              setModalVisible(false);
              setColorActual("amarillo");
              reproducirInstruccion("amarillo");
            }
          });
          setModalVisible(true);
        } else if (colorActual === "amarillo") {
          setDatosModal({
            titulo: "¡Felicidades!",
            msg: "Has completado todo el Pre-Nivel. ¡Los mundos del mapa ya están listos! 🏆",
            icono: "🦉👑",
            accion: () => procesarFinPreNivel()
          });
          setModalVisible(true);
        }
      } else {
        setDatosModal({
          titulo: "¡Lo lograste!",
          msg: `¡Completaste con éxito el nivel del color ${colorActual.toUpperCase()}! 🎉`,
          icono: "🏅",
          accion: () => {
            setModalVisible(false);
            navigation.navigate('MenuPrincipal');
          }
        });
        setModalVisible(true);
      }
    } else {
      setDatosModal({
        titulo: "¡Casi!",
        msg: `Eso sonó como ${colorSeleccionado.toUpperCase()}. ¡Escuchemos de nuevo! ✨`,
        icono: "🧐",
        accion: () => {
          setModalVisible(false);
          reproducirInstruccion(colorActual);
        }
      });
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal Lúdica y Atractiva */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
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

      <Text style={styles.pruebaTexto}>{modoPreNivel ? "Modo: Pre-Nivel Inicial" : "Modo: Aventura Libre"}</Text>
      <Text style={[styles.titulo, { color: colorActual === 'rojo' ? '#DC2626' : colorActual === 'amarillo' ? '#D97706' : '#2563EB' }]}>
        Color: {colorActual.toUpperCase()}
      </Text>
      
      <View style={[styles.circuloColor, { backgroundColor: colorActual === 'rojo' ? '#EF4444' : colorActual === 'amarillo' ? '#FBBF24' : '#3B82F6' }]} />

      {!mostrarValidacion ? (
        <TouchableOpacity 
          style={[
            styles.botonMic, 
            estaEscuchando && styles.botonMicActivo,
            audioReproduciendo && styles.botonMicInactivo
          ]}
          onPress={alternarMicrofono}
          disabled={estaEscuchando || audioReproduciendo}
        >
          <Text style={styles.textoBoton}>
            {audioReproduciendo 
              ? "⏳ Escucha las instrucciones..." 
              : estaEscuchando 
                ? "🛑 Grabando audio..." 
                : "🎙️ Presiona para Hablar"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.contenedorOpciones}>
          <Text style={styles.instruccionOpcion}>¿Qué palabra pronunció el niño?</Text>
          <View style={styles.filaBotones}>
            <TouchableOpacity style={styles.btnOpcion} onPress={() => responderColor("rojo")}>
              <Text style={styles.txtOpcion}>🔴 Rojo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOpcion} onPress={() => responderColor("amarillo")}>
              <Text style={styles.txtOpcion}>🟡 Amarillo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOpcion} onPress={() => responderColor("azul")}>
              <Text style={styles.txtOpcion}>🔵 Azul</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.textoFeedback}>Dijo: "{textoReconocido}"</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pruebaTexto: { fontSize: 14, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' },
  titulo: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, marginTop: 5 },
  circuloColor: { width: 140, height: 140, borderRadius: 70, marginBottom: 30, borderWidth: 3, borderColor: '#FFF', elevation: 5 },
  botonMic: { paddingVertical: 16, paddingHorizontal: 30, backgroundColor: '#10B981', borderRadius: 30, minWidth: 260, alignItems: 'center' },
  botonMicActivo: { backgroundColor: '#EF4444' },
  botonMicInactivo: { backgroundColor: '#A0AEC0', opacity: 0.8 },
  textoBoton: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  textoFeedback: { marginTop: 30, fontSize: 16, fontStyle: 'italic', color: '#4B5563' },
  contenedorOpciones: { width: '100%', alignItems: 'center', marginTop: 10 },
  instruccionOpcion: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 15 },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  btnOpcion: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#E5E7EB', minWidth: 100, alignItems: 'center' },
  txtOpcion: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  
  // Estilos de la ventana lúdica hermosa
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContenedor: { width: width * 0.85, backgroundColor: '#FFF', borderRadius: 32, padding: 30, alignItems: 'center', elevation: 10 },
  modalIcono: { fontSize: 55, marginBottom: 15 },
  modalTitulo: { fontSize: 28, fontWeight: '900', color: '#2E75B6', marginBottom: 10, textAlign: 'center' },
  modalMensaje: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 25, lineHeight: 22, fontWeight: '600' },
  modalBoton: { backgroundColor: '#4CD964', paddingVertical: 14, paddingHorizontal: 35, borderRadius: 24, borderBottomWidth: 4, borderBottomColor: '#28A745', width: '100%', alignItems: 'center' },
  modalBotonTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});