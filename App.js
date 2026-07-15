import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Importamos de forma segura para evitar conflictos de llaves
import * as Navigators from './src/navigation/AppNavigator';
import { AventuraProvider } from './src/context/AventuraContext'; 

// Si se importó con llaves o por defecto, lo resolvemos aquí mismo
const AppNavigatorComponent = Navigators.AppNavigator || Navigators.default;

export default function App() {
  return (
    <AventuraProvider>
      <NavigationContainer>
        {AppNavigatorComponent ? (
          <AppNavigatorComponent />
        ) : (
          <React.Fragment />
        )}
      </NavigationContainer>
    </AventuraProvider>
  );
}