import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../theme/theme';

// Importaciones de tus pantallas
import SelectorPerfilScreen from '../screens/SelectorPerfilScreen';
import { RegistroPerfilScreen } from '../screens/RegistroPerfilScreen'; // ¡Agregada!
import { MapaNivelesScreen } from '../screens/MapaNivelesScreen';
import { MotorJuegoScreen } from '../screens/MotorJuegoScreen';
import { PanelPadresScreen } from '../screens/PanelPadresScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="SelectorPerfil"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: COLORS.fondo },
        statusBarColor: COLORS.fondo,
        statusBarStyle: 'dark',
        navigationBarColor: COLORS.fondo,
        animationDuration: 220,
      }}
    >
      {/* Pantalla de inicio con los botones de entrar y crear perfil */}
      <Stack.Screen 
        name="SelectorPerfil" 
        component={SelectorPerfilScreen} 
      />
      
      {/* Ruta añadida para resolver el error del botón de creación de perfiles */}
      <Stack.Screen 
        name="RegistroPerfil" 
        component={RegistroPerfilScreen} 
      />

      <Stack.Screen 
        name="MenuPrincipal" 
        component={MapaNivelesScreen} 
      />
      <Stack.Screen 
        name="MotorJuego" 
        component={MotorJuegoScreen} 
      />
      <Stack.Screen 
        name="PanelPadres" 
        component={PanelPadresScreen} 
      />
    </Stack.Navigator>
  );
};