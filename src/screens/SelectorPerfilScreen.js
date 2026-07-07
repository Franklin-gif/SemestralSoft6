// src/screens/SelectorPerfilScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { AUDIO_CATALOG } from '../utils/audioCatalog';
import { AventuraContext } from '../context/AventuraContext'; 

const { width } = Dimensions.get('window');

export const SelectorPerfilScreen = ({ navigation }) => {
  const [musica, setMusica] = useState(null);
  const contextoAventura = useContext(AventuraContext); 

  useEffect(() => {
    const iniciarMusica = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(AUDIO_CATALOG.instrucciones.inicio);
        setMusica(sound);
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (error) {
        console.log("Error al cargar música en inicio:", error);
      }
    };
    iniciarMusica();

    return () => {};
  }, []);

  const manejarEntradaNino = () => {
    const perfilPorDefecto = {
      nombre: "Pequeño Aventurero",
      avatar: "👶",
      nivelesCompletados: []
    };

    if (contextoAventura) {
      if (typeof contextoAventura.setPerfilActivo === 'function') {
        contextoAventura.setPerfilActivo(perfilPorDefecto);
      } else if (typeof contextoAventura.seleccionarPerfil === 'function') {
        contextoAventura.seleccionarPerfil(perfilPorDefecto);
      }
    }
    
    navigation.navigate('MenuPrincipal');
  };

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
            <Text style={styles.textoBotonGrande}>¡Entrar a Jugar!</Text>
            <Text style={styles.textoBotonSub}>Modo Niños</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSecundario} onPress={manejarEntradaNino}>
          <Text style={styles.textoBotonSecundario}>👶 Crear Perfil Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decoracionAbajo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF4FA', justifyContent: 'center', alignItems: 'center' },
  ContenedorCuerpo: { zIndex: 5, alignItems: 'center', width: '100%', paddingHorizontal: 24 },
  logoContenedor: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 8, marginBottom: 20 },
  emojiLogo: { fontSize: 60 },
  tituloApp: { fontSize: 42, fontWeight: '900', color: '#2E75B6', textAlign: 'center' },
  subtituloApp: { fontSize: 16, color: '#657786', textAlign: 'center', marginTop: 8, marginBottom: 45, fontWeight: '600' },
  botonPrincipal: { flexDirection: 'row', width: width * 0.8, paddingVertical: 18, paddingHorizontal: 25, backgroundColor: '#4CD964', borderRadius: 28, alignItems: 'center', elevation: 6, borderBottomWidth: 5, borderBottomColor: '#28A745', marginBottom: 20 },
  iconoBoton: { fontSize: 35, marginRight: 15 },
  contenedorTextoBoton: { flex: 1, justifyContent: 'center' },
  textoBotonGrande: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  textoBotonSub: { fontSize: 13, color: '#E8FAD4', fontWeight: '600', textTransform: 'uppercase' },
  botonSecundario: { width: width * 0.8, paddingVertical: 14, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 2, borderColor: '#B0D4DE', alignItems: 'center', elevation: 2 },
  textoBotonSecundario: { fontSize: 16, fontWeight: 'bold', color: '#2E75B6' },
  decoracionArriba: { position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#D2E9F9', opacity: 0.6 },
  decoracionAbajo: { position: 'absolute', bottom: -80, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#BBDDF6', opacity: 0.4 }
});

export default SelectorPerfilScreen;