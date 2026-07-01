import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AventuraContext = createContext();

export const AventuraProvider = ({ children }) => {
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivoId, setPerfilActivoId] = useState(null);
  
  // Estadísticas analíticas para el panel de padres (anonimizadas y constructivas)
  const [estadisticas, setEstadisticas] = useState({});

  // Cargar datos al iniciar la app
  useEffect(() => {
    const cargarDatos = async () => {
      const perfilesGuardados = await AsyncStorage.getItem('@Lumi_perfiles');
      const estadisticasGuardadas = await AsyncStorage.getItem('@Lumi_estadisticas');
      if (perfilesGuardados) setPerfiles(JSON.parse(perfilesGuardados));
      if (estadisticasGuardadas) setEstadisticas(JSON.parse(estadisticasGuardadas));
    };
    cargarDatos();
  }, []);

  const guardarEnDisco = async (nuevosPerfiles, nuevasEstadisticas) => {
    await AsyncStorage.setItem('@Lumi_perfiles', JSON.stringify(nuevosPerfiles));
    await AsyncStorage.setItem('@Lumi_estadisticas', JSON.stringify(nuevasEstadisticas));
  };

  // Crear un nuevo perfil de niño
  const crearPerfil = async (nombre, avatar) => {
    const nuevoPerfil = {
      id: Date.now().toString(),
      nombre: nombre,
      avatar: avatar,
      estrellas: 0,
      nivelesCompletados: [], // e.g., ['nivel_1']
      insignias: []
    };
    const actualizados = [...perfiles, nuevoPerfil];
    setPerfiles(actualizados);
    if (!perfilActivoId) setPerfilActivoId(nuevoPerfil.id);
    await guardarEnDisco(actualizados, estadisticas);
  };

  // Cambiar de usuario actual
  const seleccionarPerfil = (id) => {
    setPerfilActivoId(id);
  };

  const obtenerPerfilActivo = () => {
    return perfiles.find(p => p.id === perfilActivoId) || null;
  };

  // Registrar un acierto e incrementar progreso de forma permanente (nunca regresivo)
  const completarNivel = async (nivelId, estrellasGanadas, iconoMedalla) => {
    const actualizados = perfiles.map(p => {
      if (p.id === perfilActivoId) {
        const yaCompletado = p.nivelesCompletados.includes(nivelId);
        return {
          ...p,
          estrellas: p.estrellas + (yaCompletado ? 5 : estrellasGanadas),
          nivelesCompletados: yaCompletado ? p.nivelesCompletados : [...p.nivelesCompletados, nivelId],
          insignias: yaCompletado ? p.insignias : [...p.insignias, iconoMedalla]
        };
      }
      return p;
    });
    setPerfiles(actualizados);
    await guardarEnDisco(actualizados, estadisticas);
  };

  // Registrar un intento (tanto acierto como fallo) para mapear áreas de práctica para los padres
  const registrarIntentoPedagogico = async (colorTematica, fueExitoso) => {
    const niñoId = perfilActivoId;
    const copiaEstadisticas = { ...estadisticas };
    
    if (!copiaEstadisticas[niñoId]) copiaEstadisticas[niñoId] = {};
    if (!copiaEstadisticas[niñoId][colorTematica]) {
      copiaEstadisticas[niñoId][colorTematica] = { aciertos: 0, intentosTotales: 0 };
    }

    copiaEstadisticas[niñoId][colorTematica].intentosTotales += 1;
    if (fueExitoso) {
      copiaEstadisticas[niñoId][colorTematica].aciertos += 1;
    }

    setEstadisticas(copiaEstadisticas);
    await guardarEnDisco(perfiles, copiaEstadisticas);
  };

  return (
    <AventuraContext.Provider value={{
      perfiles,
      perfilActivo: obtenerPerfilActivo(),
      estadisticas,
      crearPerfil,
      seleccionarPerfil,
      completarNivel,
      registrarIntentoPedagogico
    }}>
      {children}
    </AventuraContext.Provider>
  );
};