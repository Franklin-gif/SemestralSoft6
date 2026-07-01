import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AventuraProvider } from './src/context/AventuraContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AventuraProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.contenedor}>
          <StatusBar barStyle="dark-content" backgroundColor="#F5F9FC" />
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </AventuraProvider>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },
});