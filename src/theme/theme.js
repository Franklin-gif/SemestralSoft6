// src/theme/theme.js
// -----------------------------------------------------------------------------
// TEMA GLOBAL DE "MUNDO COLORÍN"
// -----------------------------------------------------------------------------
// Este archivo es el equivalente, en React Native, a una hoja de estilos CSS
// global: TODO lo visual de la app (colores, tipografías, espaciados, bordes,
// sombras) vive aquí. Si quieres cambiar el look completo de la app, este es
// el único archivo que necesitas tocar.
//
// Uso en cualquier pantalla:
//   import { COLORS, FONT, SPACING, RADIUS, SHADOW } from '../theme/theme';
//   ...
//   backgroundColor: COLORS.primary
// -----------------------------------------------------------------------------

import { Platform } from 'react-native';

// -----------------------------------------------------------------------------
// 1. PALETA DE COLORES
// -----------------------------------------------------------------------------
export const COLORS = {
  // Marca / identidad
  primary: '#2E75B6',        // Azul principal (botones secundarios, títulos)
  primaryDark: '#1E3A8A',
  primaryLight: '#EBF4FA',
  primarySoft: '#DCEEFF',

  secondary: '#4CD964',      // Verde de acción principal (jugar, continuar)
  secondaryDark: '#28A745',

  accent: '#FFD166',         // Amarillo de acentos / progreso

  // Colores temáticos del juego (deben coincidir con niveles.json)
  colorRojo: '#EF4444',
  colorRojoOscuro: '#DC2626',
  colorAzul: '#3B82F6',
  colorAzulOscuro: '#2563EB',
  colorAmarillo: '#FBBF24',
  colorAmarilloOscuro: '#D97706',

  // Estados
  exito: '#4CAF50',
  advertencia: '#FFB300',
  error: '#E8722C',
  errorFuerte: '#DC2626',
  peligro: '#FF5A5F',
  peligroOscuro: '#C0392B',

  // Neutros / superficies
  fondo: '#F9FBFD',
  fondoAlterno: '#EBF4FA',
  superficie: '#FFFFFF',
  borde: '#CBD5E1',
  bordeSuave: '#E2E8F0',
  bloqueado: '#D6E4EB',
  deshabilitado: '#94A3B8',
  deshabilitadoOscuro: '#64748B',
  superficieSuave: '#F8FAFC',
  superficieExito: '#E8FAD4',
  superficieAlerta: '#FFF9E6',
  bordeAlerta: '#FFE082',
  superposicion: 'rgba(0,0,0,0.6)',

  // Texto
  texto: '#1E293B',
  textoSecundario: '#475569',
  textoMuted: '#718096',
  textoClaro: '#FFFFFF',

  // Micrófono / voz
  micInactivo: '#10B981',
  micActivo: '#EF4444',
  micDeshabilitado: '#A0AEC0',
};

// -----------------------------------------------------------------------------
// 2. TIPOGRAFÍA
// -----------------------------------------------------------------------------
export const FONT = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 36,
    hero: 42,
  },
  weight: {
    regular: '500',
    bold: '700',
    black: '900',
  },
};

// -----------------------------------------------------------------------------
// 3. ESPACIADOS
// -----------------------------------------------------------------------------
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};


// Medidas reutilizables para mantener controles c?modos y consistentes.
export const SIZE = {
  touchTarget: 48,
  avatar: 60,
  icon: 32,
  logo: 130,
  colorCircle: 150,
};
// -----------------------------------------------------------------------------
// 4. RADIOS DE BORDE
// -----------------------------------------------------------------------------
export const RADIUS = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
};

// -----------------------------------------------------------------------------
// 5. SOMBRAS (iOS shadow* + Android elevation en un solo objeto)
// -----------------------------------------------------------------------------
const crearSombra = (elevacion, opacidad = 0.15) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: elevacion / 2 },
  shadowOpacity: opacidad,
  shadowRadius: elevacion,
  elevation: elevacion,
});

export const SHADOW = {
  sm: crearSombra(2, 0.08),
  md: crearSombra(4, 0.12),
  lg: crearSombra(8, 0.18),
};

// -----------------------------------------------------------------------------
// 6. AYUDANTES DE COLOR POR TEMÁTICA (rojo / azul / amarillo)
// -----------------------------------------------------------------------------
export const COLOR_POR_NOMBRE = {
  rojo: { claro: COLORS.colorRojo, oscuro: COLORS.colorRojoOscuro },
  azul: { claro: COLORS.colorAzul, oscuro: COLORS.colorAzulOscuro },
  amarillo: { claro: COLORS.colorAmarillo, oscuro: COLORS.colorAmarilloOscuro },
};

export const obtenerColorTematico = (nombreColor, variante = 'oscuro') => {
  return COLOR_POR_NOMBRE[nombreColor]?.[variante] || COLORS.primary;
};

export default { COLORS, FONT, SPACING, RADIUS, SHADOW, COLOR_POR_NOMBRE, obtenerColorTematico };