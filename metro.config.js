// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @react-native-voice/voice es un módulo nativo que no es compatible con Web.
// Aunque en el código lo protegemos con try/catch en tiempo de ejecución,
// Metro (el bundler) igual intenta RESOLVER el archivo en tiempo de build,
// y eso puede tumbar el bundle de web con un error 500.
//
// Esta configuración le dice a Metro: "cuando compiles para la plataforma web,
// reemplaza cualquier import de @react-native-voice/voice por un módulo vacío".
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@react-native-voice/voice') {
    return {
      type: 'empty',
    };
  }

  // Para todo lo demás, usamos la resolución default de Metro
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;