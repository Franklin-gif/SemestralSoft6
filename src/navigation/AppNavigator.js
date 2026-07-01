import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { BotonMagico } from '../components/BotonMagico';
import { SelectorPerfilScreen } from '../screens/SelectorPerfilScreen';
import { MapaNivelesScreen } from '../screens/MapaNivelesScreen';
import { MotorJuegoScreen } from '../screens/MotorJuegoScreen';
import { PanelPadresScreen } from '../screens/PanelPadresScreen';
import { useContext } from 'react';
import { AventuraContext } from '../context/AventuraContext';

const Stack = createStackNavigator();

const MenuPrincipal = ({ navigation }) => {
  const { perfilActivo } = useContext(AventuraContext);

  return (
    <View style={styles.center}>
      {perfilActivo ? (
        <>
          <Text style={styles.avatar}>{perfilActivo.avatar}</Text>
          <Text style={styles.bienvenida}>¡Hola, {perfilActivo.nombre}! 👋</Text>
          <Text style={styles.estrellas}>Tienes ⭐ {perfilActivo.estrellas} estrellas</Text>
        </>
      ) : (
        <Text style={styles.bienvenida}>¡Bienvenido a LUMI!</Text>
      )}

      <BotonMagico title="Aprender" color="#2E75B6" style={styles.mb} onPress={() => {
        if (!perfilActivo) navigation.navigate('SelectorPerfil');
        else navigation.navigate('MapaNiveles');
      }} />
      
      <BotonMagico title="Cambiar Perfil" color="#4CAF50" style={styles.mb} onPress={() => navigation.navigate('SelectorPerfil')} />
      <BotonMagico title="Panel Padres" color="#E8722C" onPress={() => navigation.navigate('PanelPadres')} />
    </View>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuPrincipal" component={MenuPrincipal} />
      <Stack.Screen name="SelectorPerfil" component={SelectorPerfilScreen} />
      <Stack.Screen name="MapaNiveles" component={MapaNivelesScreen} />
      <Stack.Screen name="MotorJuego" component={MotorJuegoScreen} />
      <Stack.Screen name="PanelPadres" component={PanelPadresScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FC', padding: 20 },
  avatar: { fontSize: 60, marginBottom: 10 },
  bienvenida: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  estrellas: { fontSize: 18, color: '#E8722C', fontWeight: 'bold', marginBottom: 35 },
  mb: { marginBottom: 16 }
});