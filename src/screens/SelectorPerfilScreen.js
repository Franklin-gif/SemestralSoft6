import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import { BotonMagico } from '../components/BotonMagico';

const AVATARES_DISPONIBLES = ['🦁', '🦊', '🐨', '🦄', '🐼'];

export const SelectorPerfilScreen = ({ navigation }) => {
  const { perfiles, crearPerfil, seleccionarPerfil } = useContext(AventuraContext);
  const [nombre, setNombre] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('🦁');

  const manejarCreacion = () => {
    if (nombre.trim().length > 1) {
      crearPerfil(nombre.trim(), avatarSeleccionado);
      setNombre('');
      navigation.navigate('MenuPrincipal');
    }
  };

  const manejarSeleccion = (id) => {
    seleccionarPerfil(id);
    navigation.navigate('MenuPrincipal');
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>¿Quién va a jugar hoy?</Text>

      {/* Lista de Perfiles Existentes */}
      {perfiles.length > 0 && (
        <View style={styles.seccionPerfiles}>
          <FlatList
            data={perfiles}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.tarjetaPerfil} onPress={() => manejarSeleccion(item.id)}>
                <Text style={styles.avatarGrande}>{item.avatar}</Text>
                <Text style={styles.nombrePerfil}>{item.nombre}</Text>
                <Text style={styles.estrellasPerfil}>⭐ {item.estrellas}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Formulario Crear Nuevo Perfil */}
      <View style={styles.formulario}>
        <Text style={styles.subtitulo}>Crear nuevo amiguito:</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu nombre aquí"
          value={nombre}
          onChangeText={setNombre}
          maxLength={12}
        />
        
        <Text style={styles.label}>Elige tu avatar de la suerte:</Text>
        <View style={styles.rowAvatares}>
          {AVATARES_DISPONIBLES.map(av => (
            <TouchableOpacity 
              key={av} 
              style={[styles.btnAvatar, avatarSeleccionado === av && styles.avatarActivo]}
              onPress={() => setAvatarSeleccionado(av)}
            >
              <Text style={styles.avatarOp}>{av}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <BotonMagico title="¡Empezar Aventura!" color="#4CAF50" onPress={manejarCreacion} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FFF', padding: 24, justifyContent: 'space-around' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 30 },
  seccionPerfiles: { height: 140, marginVertical: 10 },
  tarjetaPerfil: { alignItems: 'center', padding: 12, backgroundColor: '#F0F7FA', borderRadius: 20, marginRight: 16, minWidth: 100, borderWidth: 1, borderColor: '#B0D4DE' },
  avatarGrande: { fontSize: 40 },
  nombrePerfil: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  estrellasPerfil: { fontSize: 12, color: '#E8722C', fontWeight: '600' },
  formulario: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#EEE' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 12 },
  input: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#DDD', borderRadius: 16, padding: 14, fontSize: 18, marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 15, color: '#666', marginBottom: 10 },
  rowAvatares: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  btnAvatar: { padding: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EEE' },
  avatarActivo: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  avatarOp: { fontSize: 30 }
});