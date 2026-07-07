// src/screens/MapaNivelesScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { AventuraContext } from '../context/AventuraContext';
import estructuraNiveles from '../data/niveles.json'; 

export const MapaNivelesScreen = ({ navigation }) => {
  const { perfilActivo, setPerfilActivo } = useContext(AventuraContext);

  // 🎯 Mecanismo de autoreparación segura si el estado llegase a fallar
  const perfilSeguro = perfilActivo || {
    nombre: "Pequeño Aventurero",
    avatar: "👶",
    nivelesCompletados: []
  };

  const manejarNavegacionJuego = async (nivelId) => {
    try {
      await Audio.setIsEnabledAsync(false);
      await Audio.setIsEnabledAsync(true); 
    } catch (e) { 
      console.log("Error al limpiar canales de audio:", e); 
    }

    let colorInicial = "azul"; 
    let esModoPreNivel = false;

    if (nivelId === "pre_nivel") {
      colorInicial = "azul"; 
      esModoPreNivel = true;
    } else if (nivelId.toLowerCase().includes("rojo") || nivelId === "nivel_rojo") {
      colorInicial = "rojo";
      esModoPreNivel = false;
    } else if (nivelId.toLowerCase().includes("amarillo") || nivelId === "nivel_amarillo") {
      colorInicial = "amarillo";
      esModoPreNivel = false;
    } else if (nivelId.toLowerCase().includes("azul") || nivelId === "nivel_azul") {
      colorInicial = "azul";
      esModoPreNivel = false;
    }

    navigation.navigate('MotorJuego', { 
      colorNivel: colorInicial,
      esPreNivel: esModoPreNivel
    });
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.saludo}>¡A aprender, {perfilSeguro.nombre}! 🚀</Text>
        <Text style={styles.sub}>Elige tu próxima aventura de color</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollMapa}>
        {estructuraNiveles.niveles.map((nivel, index) => {
          const esPrimerNivel = index === 0;
          const estaDesbloqueado = esPrimerNivel || perfilSeguro.nivelesCompletados.includes(estructuraNiveles.niveles[index - 1]?.id);

          return (
            <TouchableOpacity
              key={nivel.id}
              disabled={!estaDesbloqueado}
              onPress={() => manejarNavegacionJuego(nivel.id)}
              style={[styles.tarjetaNivel, estaDesbloqueado ? styles.desbloqueado : styles.bloqueado]}
            >
              <View style={styles.badgeIcono}>
                <Text style={styles.iconoText}>{estaDesbloqueado ? nivel.recompensaIcono : '🔒'}</Text>
              </View>
              <View style={styles.infoNivel}>
                <Text style={styles.tituloNivel}>{nivel.titulo}</Text>
                <Text style={styles.tematica}>{nivel.tematica}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EBF4FA', padding: 16 },
  header: { marginTop: 40, marginBottom: 20, alignItems: 'center' },
  saludo: { fontSize: 26, fontWeight: 'bold', color: '#2E75B6' },
  sub: { fontSize: 16, color: '#555', marginTop: 4 },
  scrollMapa: { alignItems: 'center', paddingBottom: 40 },
  tarjetaNivel: { flexDirection: 'row', width: '90%', minHeight: 100, borderRadius: 24, marginVertical: 12, padding: 16, alignItems: 'center', elevation: 4 },
  desbloqueado: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#B0D4DE' },
  bloqueado: { backgroundColor: '#D6E4EB', opacity: 0.7 },
  badgeIcono: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7FA', justifyContent: 'center', alignItems: 'center' },
  iconoText: { fontSize: 32 },
  infoNivel: { marginLeft: 16, flex: 1 },
  tituloNivel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tematica: { fontSize: 14, color: '#666', marginTop: 2 }
});