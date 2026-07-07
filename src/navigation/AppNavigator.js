// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importaciones corregidas sin llaves conflictivas
import SelectorPerfilScreen from '../screens/SelectorPerfilScreen';
import { MapaNivelesScreen } from '../screens/MapaNivelesScreen';
import { MotorJuegoScreen } from '../screens/MotorJuegoScreen';
import { PanelPadresScreen } from '../screens/PanelPadresScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="SelectorPerfil"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="SelectorPerfil" 
        component={SelectorPerfilScreen} 
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