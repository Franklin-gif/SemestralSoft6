import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import { COLORS, FONT, SPACING, RADIUS, SHADOW } from '../theme/theme';

const AVATARES = ['👶', '🦁', '🚀', '🦄', '🦖', '🎨', '🐱', '🦊'];

export const RegistroPerfilScreen = ({ navigation }) => {
  const { setPerfilActivo } = useContext(AventuraContext);
  const [nombre, setNombre] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('👶');

  const manejarRegistro = () => {
    if (!nombre.trim()) return;

    setPerfilActivo({
      nombre: nombre.trim(),
      avatar: avatarSeleccionado,
      nivelesCompletados: [],
    });

    navigation.replace('MenuPrincipal');
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.logoOjo}>🦉</Text>
      <Text style={styles.titulo}>¡Tu Nueva Aventura!</Text>
      <Text style={styles.subtitulo}>¿Cómo te llamas, pequeño aventurero?</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe tu nombre aquí..."
        placeholderTextColor={COLORS.deshabilitado}
        value={nombre}
        onChangeText={setNombre}
        maxLength={12}
      />

      <Text style={styles.seccionAvatar}>Elige tu compañero de juego:</Text>
      <View style={styles.gridAvatares}>
        {AVATARES.map((avatar) => (
          <TouchableOpacity
            key={avatar}
            style={[styles.avatarBoton, avatarSeleccionado === avatar && styles.avatarSeleccionado]}
            onPress={() => setAvatarSeleccionado(avatar)}
          >
            <Text style={styles.avatarTexto}>{avatar}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.botonEntrar, !nombre.trim() && styles.botonEntrarDesactivado]}
        onPress={manejarRegistro}
        disabled={!nombre.trim()}
      >
        <Text style={styles.textoBotonEntrar}>¡Comenzar a Jugar! 🚀</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.fondoAlterno, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  logoOjo: { fontSize: 60, marginBottom: SPACING.sm },
  titulo: { fontSize: FONT.size.display, fontWeight: FONT.weight.black, color: COLORS.primaryDark, marginBottom: SPACING.xs },
  subtitulo: { fontSize: FONT.size.md, color: COLORS.textoSecundario, marginBottom: SPACING.lg, textAlign: 'center', fontWeight: FONT.weight.bold },
  input: { width: '100%', backgroundColor: COLORS.superficie, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, fontSize: FONT.size.lg, fontWeight: FONT.weight.bold, color: COLORS.texto, borderWidth: 3, borderColor: COLORS.borde, textAlign: 'center', marginBottom: SPACING.lg },
  seccionAvatar: { fontSize: FONT.size.md, fontWeight: FONT.weight.bold, color: COLORS.textoSecundario, marginBottom: SPACING.md },
  gridAvatares: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.xxl, width: '100%' },
  avatarBoton: { width: 60, height: 60, backgroundColor: COLORS.superficie, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.bordeSuave, ...SHADOW.sm },
  avatarSeleccionado: { borderColor: COLORS.colorAzul, backgroundColor: COLORS.primarySoft, transform: [{ scale: 1.1 }] },
  avatarTexto: { fontSize: 30 },
  botonEntrar: { width: '100%', backgroundColor: COLORS.secondary, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, borderBottomWidth: 6, borderBottomColor: COLORS.secondaryDark, alignItems: 'center' },
  botonEntrarDesactivado: { backgroundColor: COLORS.deshabilitado, borderBottomColor: COLORS.deshabilitadoOscuro, opacity: 0.6 },
  textoBotonEntrar: { color: COLORS.textoClaro, fontSize: FONT.size.xl, fontWeight: FONT.weight.bold },
});

export default RegistroPerfilScreen;