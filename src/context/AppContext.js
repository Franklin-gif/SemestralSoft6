import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Datos del perfil del niño
  const [perfil, setPerfil] = useState({
    nombre: '',
    avatar: 'valiente',
    estrellas: 125,
    recompensas: ['sol_feliz', 'nube_lluvia'],
  });

  // Configuraciones de accesibilidad y control parental
  const [configuracion, setConfiguracion] = useState({
    limiteTiempo: 20, // en minutos
    pictogramas: false,
    altoContraste: false,
    velocidadNarracion: 1.0,
  });

  const agregarEstrella = (cantidad) => {
    setPerfil(prev => ({ ...prev, estrellas: prev.estrellas + cantidad }));
  };

  const desbloquearRecompensa = (idRecompensa) => {
    if (!perfil.recompensas.includes(idRecompensa)) {
      setPerfil(prev => ({
        ...prev,
        recompensas: [...prev.recompensas, idRecompensa]
      }));
    }
  };

  return (
    <AppContext.Provider value={{ perfil, setPerfil, configuracion, setConfiguracion, agregarEstrella, desbloquearRecompensa }}>
      {children}
    </AppContext.Provider>
  );
};