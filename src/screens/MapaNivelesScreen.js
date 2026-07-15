import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { AventuraContext } from '../context/AventuraContext';
import estructuraNiveles from '../data/niveles.json';
import { COLORS, FONT, SPACING, RADIUS, SHADOW } from '../theme/theme';

export const MapaNivelesScreen = ({ navigation }) => {
  const { perfilActivo } = useContext(AventuraContext);

  const perfilSeguro = perfilActivo || {
    nombre: 'Aventurero',
    avatar: '👶',
    nivelesCompletados: [],
  };

  const manejarNavegacionJuego = async (nivelId) => {
    try {
      await Audio.setIsEnabledAsync(false);
      await Audio.setIsEnabledAsync(true);
    } catch (e) {
      console.log('Error al limpiar canales de audio:', e);
    }

    let colorInicial = 'azul';
    let esModoPreNivel = false;

    if (nivelId === 'pre_nivel') {
      colorInicial = 'azul';
      esModoPreNivel = true;
    } else if (nivelId.toLowerCase().includes('rojo') || nivelId === 'nivel_rojo' || nivelId === 'nivel_1') {
      colorInicial = 'rojo';
      esModoPreNivel = false;
    } else if (nivelId.toLowerCase().includes('amarillo') || nivelId === 'nivel_amarillo') {
      colorInicial = 'amarillo';
      esModoPreNivel = false;
    } else if (nivelId.toLowerCase().includes('azul') || nivelId === 'nivel_azul' || nivelId === 'nivel_2') {
      colorInicial = 'azul';
      esModoPreNivel = false;
    }

    navigation.navigate('MotorJuego', {
      nivelId,
      colorNivel: colorInicial,
      esPreNivel: esModoPreNivel,
    });
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraSuperior}>
        <TouchableOpacity style={styles.botonRetroceder} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'SelectorPerfil' }] })}>
          <Text style={styles.textoRetroceder}>⬅️ Volver</Text>
        </TouchableOpacity>

        <View style={styles.badgePerfilDerecha}>
          <Text style={styles.avatarTextoTop}>{perfilSeguro.avatar}</Text>
          <Text style={styles.nombreTextoTop} numberOfLines={1}>{perfilSeguro.nombre}</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.saludo}>¡A aprender, {perfilSeguro.nombre}! 🚀</Text>
        <Text style={styles.sub}>Elige tu próxima aventura de color</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollMapa} showsVerticalScrollIndicator={false}>
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
  contenedor: { flex: 1, backgroundColor: COLORS.fondoAlterno, padding: SPACING.md },
  barraSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, width: '100%' },
  botonRetroceder: { backgroundColor: COLORS.peligro, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm, borderBottomWidth: 3, borderBottomColor: COLORS.peligroOscuro },
  textoRetroceder: { color: COLORS.textoClaro, fontWeight: FONT.weight.bold, fontSize: FONT.size.sm },

  badgePerfilDerecha: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.superficie, paddingVertical: SPACING.sm, paddingHorizontal: 14, borderRadius: RADIUS.pill, borderWidth: 2, borderColor: COLORS.borde, maxWidth: 160, ...SHADOW.sm },
  avatarTextoTop: { fontSize: 18, marginRight: 6 },
  nombreTextoTop: { fontSize: FONT.size.sm, fontWeight: FONT.weight.black, color: COLORS.texto },

  header: { marginTop: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  saludo: { fontSize: FONT.size.xxl, fontWeight: FONT.weight.black, color: COLORS.primary, textAlign: 'center' },
  sub: { fontSize: FONT.size.md, color: COLORS.textoSecundario, marginTop: SPACING.xs, fontWeight: FONT.weight.bold },
  scrollMapa: { alignItems: 'center', paddingBottom: SPACING.xxl },
  tarjetaNivel: { flexDirection: 'row', width: '95%', minHeight: 100, borderRadius: RADIUS.xl, marginVertical: SPACING.sm, padding: SPACING.md, alignItems: 'center', ...SHADOW.md },
  desbloqueado: { backgroundColor: COLORS.superficie, borderWidth: 2, borderColor: COLORS.borde, borderBottomWidth: 6, borderBottomColor: COLORS.borde },
  bloqueado: { backgroundColor: COLORS.bloqueado, opacity: 0.7, borderWidth: 1, borderColor: COLORS.borde },
  badgeIcono: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.fondoAlterno, justifyContent: 'center', alignItems: 'center' },
  iconoText: { fontSize: 32 },
  infoNivel: { marginLeft: SPACING.md, flex: 1 },
  tituloNivel: { fontSize: FONT.size.xl, fontWeight: FONT.weight.bold, color: COLORS.texto },
  tematica: { fontSize: FONT.size.sm, color: COLORS.textoMuted, marginTop: 2, fontWeight: FONT.weight.bold },
});

export default MapaNivelesScreen;