import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AventuraContext = createContext();

export const AventuraProvider = ({ children }) => {
  const [perfilActivo, setPerfilActivoState] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // CLAVE PARA ALMACENAR EN EL DISPOSITIVO
  const STORAGE_KEY = '@mundo_colorin_perfil';

  // 1. Cargar el perfil automáticamente al abrir la aplicación
  useEffect(() => {
    const cargarPerfilGuardado = async () => {
      try {
        const perfilJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (perfilJson !== null) {
          setPerfilActivoState(JSON.parse(perfilJson));
        }
      } catch (error) {
        console.log("Error al cargar el perfil desde el dispositivo:", error);
      } finally {
        setCargandoPerfil(false);
      }
    };

    cargarPerfilGuardado();
  }, []);

  // 2. Función contenedora para actualizar el estado y guardar en el almacenamiento local
  const setPerfilActivo = async (nuevoPerfil) => {
    try {
      if (nuevoPerfil) {
        setPerfilActivoState(nuevoPerfil);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoPerfil));
      } else {
        // Si se pasa null, se borra el perfil (por ejemplo, para resetear)
        setPerfilActivoState(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.log("Error al guardar el perfil en el dispositivo:", error);
    }
  };

  return (
    <AventuraContext.Provider 
      value={{ 
        perfilActivo, 
        setPerfilActivo,
        cargandoPerfil 
      }}
    >
      {children}
    </AventuraContext.Provider>
  );
};