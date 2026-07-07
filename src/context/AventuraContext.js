// src/context/AventuraContext.js
import React, { createContext, useState } from 'react';

export const AventuraContext = createContext();

export const AventuraProvider = ({ children }) => {
  // 🎯 Inicializa con un perfil por defecto para que ninguna pantalla se bloquee al iniciar
  const [perfilActivo, setPerfilActivo] = useState({
    nombre: "Pequeño Aventurero",
    avatar: "👶",
    nivelesCompletados: []
  });

  const seleccionarPerfil = (perfil) => {
    setPerfilActivo(perfil);
  };

  return (
    <AventuraContext.Provider value={{ 
      perfilActivo, 
      setPerfilActivo, 
      seleccionarPerfil 
    }}>
      {children}
    </AventuraContext.Provider>
  );
};