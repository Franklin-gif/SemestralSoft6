import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import estructuraNiveles from '../data/niveles.json';

export const MapaNivelesScreen = ({ navigation }) => {
  const { perfilActivo } = useContext(AventuraContext);

  if (!perfilActivo) {
    return (
      <View style={styles.center}><Text>Por favor crea un perfil primero.</Text></View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.saludo}>¡A aprender, {perfilActivo.nombre}! 🚀</Text>
        <Text style={styles.sub}>Elige tu próxima aventura de color</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollMapa}>
        {estructuraNiveles.niveles.map((nivel, index) => {
          // El primer nivel siempre está abierto. Los siguientes requieren haber completado el anterior.
          const esPrimerNivel = index === 0;
          const nivelAnteriorCompletado = perfilActivo.nivelesCompletados.includes(
            estructuraNiveles.niveles[index - 1]?.id
          );
          const estaDesbloqueado = esPrimerNivel || nivelAnteriorCompletado;
          const yaLoCompleto = perfilActivo.nivelesCompletados.includes(nivel.id);

          return (
            <TouchableOpacity
              key={nivel.id}
              disabled={!estaDesbloqueado}
              onPress={() => navigation.navigate('MotorJuego', { nivelId: nivel.id })}
              style={[
                styles.tarjetaNivel,
                estaDesbloqueado ? styles.desbloqueado : styles.bloqueado
              ]}
            >
              <View style={styles.badgeIcono}>
                <Text style={styles.iconoText}>
                  {estaDesbloqueado ? nivel.recompensaIcono : '🔒'}
                </Text>
              </View>
              <View style={styles.infoNivel}>
                <Text style={styles.tituloNivel}>{nivel.titulo}</Text>
                <Text style={styles.tematica}>{nivel.tematica}</Text>
                {yaLoCompleto && <Text style={styles.completadoText}>✨ ¡Completado! ✨</Text>}
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
  saludo: { fontSize: 26, fontWeight: 'bold', color: '#2E75B6', textAlign: 'center' },
  sub: { fontSize: 16, color: '#555', marginTop: 4 },
  scrollMapa: { alignItems: 'center', paddingBottom: 40 },
  tarjetaNivel: {
    flexDirection: 'row',
    width: '90%',
    minHeight: 100,
    borderRadius: 24,
    marginVertical: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desbloqueado: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#B0D4DE' },
  bloqueado: { backgroundColor: '#D6E4EB', opacity: 0.7 },
  badgeIcono: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7FA', justifyContent: 'center', alignItems: 'center' },
  iconoText: { fontSize: 32 },
  infoNivel: { marginLeft: 16, flex: 1 },
  tituloNivel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tematica: { fontSize: 14, color: '#666', marginTop: 2 },
  completadoText: { fontSize: 12, color: '#E8722C', fontWeight: 'bold', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});