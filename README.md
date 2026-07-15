# Mundo Color?n

**Mundo Color?n** es una aplicaci?n educativa infantil creada con Expo y React Native. Su objetivo es ayudar a ni?os y ni?as a reconocer los colores primarios mediante una experiencia visual, auditiva e interactiva: exploran niveles, escuchan instrucciones, responden con su voz y reciben retroalimentaci?n positiva.

La aplicaci?n est? pensada para funcionar en Android, iOS y web, conservando la misma experiencia pedag?gica y adaptando el reconocimiento de voz a cada plataforma.

## Contenido

- [Caracter?sticas](#caracter?sticas-principales)
- [Experiencia de aprendizaje](#experiencia-de-aprendizaje)
- [Tecnolog?as](#tecnolog?as-principales)
- [Arquitectura](#arquitectura-del-proyecto)
- [Navegaci?n](#navegaci?n)
- [Micr?fono y reconocimiento de voz](#micr?fono-y-reconocimiento-de-voz)
- [Perfiles y persistencia](#perfiles-y-persistencia)
- [Dise?o y tema](#dise?o-y-sistema-visual)
- [Ejecuci?n](#c?mo-ejecutar-el-proyecto)
- [Permisos](#permisos)

## Caracter?sticas principales

- Creaci?n y selecci?n de un perfil infantil con nombre y avatar.
- Perfil activo visible en el mapa de niveles.
- Mapa de aventuras con desbloqueo progresivo de contenido.
- Pre-nivel guiado de reconocimiento oral de azul, rojo y amarillo.
- Niveles de selecci?n visual con preguntas, pistas y mensajes motivadores.
- Reproducci?n de audio educativo e instrucciones por color.
- Reconocimiento de voz compatible con web y dispositivos nativos.
- Indicador visual de volumen mientras el micr?fono est? escuchando.
- Persistencia local del perfil y del avance mediante almacenamiento del dispositivo.
- Interfaz infantil, accesible, consistente y responsive.
- Navegaci?n controlada para evitar pantallas repetidas en el historial.

## Experiencia de aprendizaje

El recorrido inicia en **Inicio**, desde donde el ni?o puede jugar con un perfil existente o crear uno nuevo. Al pulsar ?Jugar? se abre el mapa de niveles como una nueva ra?z de navegaci?n; esto evita duplicados en el historial.

En el mapa se muestra el nombre y avatar del usuario activo. El bot?n **Volver** lleva directamente a Inicio, no a una pantalla intermedia. El primer contenido es el pre-nivel y los niveles siguientes se van habilitando seg?n el avance almacenado.

Durante los juegos se mantiene un enfoque de refuerzo positivo:

- Las respuestas correctas muestran una celebraci?n y permiten continuar.
- Las respuestas incorrectas muestran una pista clara y amable, sin penalizaciones.
- El final de cada aventura guarda el avance del perfil y devuelve al mapa.

Los contenidos se definen en `src/data/niveles.json`, por lo que se pueden a?adir m?s preguntas, opciones o mundos sin reescribir el motor del juego.

## Tecnolog?as principales

| Tecnolog?a | Uso dentro del proyecto |
| --- | --- |
| Expo SDK 54 | Base multiplataforma, configuraci?n, empaquetado y ejecuci?n. |
| React 19 y React Native 0.81 | Componentes, estado e interfaz nativa. |
| React Navigation Native Stack | Rutas y transiciones entre Inicio, perfiles, mapa y juego. |
| AsyncStorage | Guarda el perfil activo y el progreso entre sesiones. |
| expo-av | Reproduce la m?sica de inicio y audios educativos por color. |
| expo-speech-recognition | Reconocimiento de voz en compilaciones nativas. |
| Web Speech API + Web Audio API | Reconocimiento de voz y nivel de audio en la versi?n web. |
| react-native-reanimated / Animated | Microanimaciones de interacci?n y respuesta visual. |

## Arquitectura del proyecto

```text
MundoColorin/
??? assets/                 # Iconos, splash y audios educativos
??? src/
?   ??? components/         # Botones y componentes visuales reutilizables
?   ??? context/            # Estado global y perfil activo
?   ??? data/               # Niveles y actividades declarativas en JSON
?   ??? navigation/         # Stack de pantallas y transiciones
?   ??? screens/            # Pantallas de la aplicaci?n
?   ??? theme/              # Tokens visuales centralizados
?   ??? utils/              # Audio y reconocimiento de voz multiplataforma
??? App.js                  # Contenedor de navegaci?n y proveedores
??? app.json                # Configuraci?n y permisos de Expo
??? package.json            # Dependencias y comandos
```

### Pantallas

| Pantalla | Responsabilidad |
| --- | --- |
| `SelectorPerfilScreen` | Inicio; entra a jugar, crea o cambia el perfil. |
| `RegistroPerfilScreen` | Captura el nombre y permite escoger un avatar. |
| `MapaNivelesScreen` | Muestra el perfil activo, los niveles y su estado de desbloqueo. |
| `MotorJuegoScreen` | Ejecuta el pre-nivel por voz y las actividades visuales de cada aventura. |
| `PanelPadresScreen` | Vista de reporte y acciones familiares disponibles en el proyecto. |
| `ActividadScreen` | Componente de actividad guiada reutilizable. |

## Navegaci?n

La aplicaci?n utiliza un `Native Stack Navigator` configurado en `src/navigation/AppNavigator.js`.

```text
Inicio / Selector de perfil
        ?
        ??? Crear perfil ??> Registro de perfil ??> Mapa de niveles
        ?
        ??? Jugar ???????????????????????????????> Mapa de niveles
                                                     ?
                                                     ??? Nivel ??> Motor de juego
```

El flujo aplica `navigation.reset(...)` al entrar al mapa y al volver a Inicio. As? el historial queda limpio y el bot?n Volver del mapa siempre tiene un comportamiento predecible. Desde un nivel, ?Niveles? devuelve al mapa sin alterar la l?gica ni el progreso del juego.

## Micr?fono y reconocimiento de voz

Esta es una de las partes m?s innovadoras del proyecto: el pre-nivel permite que el ni?o responda **diciendo el color en voz alta**.

### En web

`src/utils/reconocimientoVoz.js` utiliza dos APIs del navegador:

- **Web Speech API**: transcribe la respuesta hablada en espa?ol (`es-ES`).
- **Web Audio API**: abre un flujo de audio con cancelaci?n de eco, supresi?n de ruido y control autom?tico de ganancia. Un `AnalyserNode` calcula el valor RMS del sonido para animar la onda de voz en tiempo real.

La implementaci?n limpia correctamente el stream, pistas del micr?fono, `AudioContext`, animaci?n y eventos al terminar. Esto reduce el riesgo de dejar el micr?fono activo al cambiar de pantalla.

### En Android e iOS

En plataformas nativas se usa `expo-speech-recognition`. Antes de escuchar se solicitan permisos de micr?fono y reconocimiento. El m?dulo recibe vocabulario contextual con los colores `azul`, `rojo` y `amarillo`, ayudando a mejorar la precisi?n del reconocimiento.

### Validaci?n pedag?gica tolerante

El motor no depende de una transcripci?n exacta: normaliza may?sculas, espacios y tildes, y contempla variantes frecuentes como `asul`, `roho` o `amario`. Esto hace la experiencia m?s amigable para pronunciaciones infantiles y para errores habituales del reconocimiento autom?tico.

La componente `OndaVoz` presenta una onda animada mientras se est? escuchando. En web refleja el volumen real; en nativo usa una representaci?n visual para confirmar que la escucha est? activa.

> En web, el reconocimiento depende de que el navegador implemente Web Speech API. Chrome y Edge suelen ofrecer mejor compatibilidad.

## Audio educativo

Los archivos de audio se centralizan en `src/utils/audioCatalog.js`. La app dispone de m?sica de inicio y de instrucciones para azul, rojo y amarillo. La reproducci?n se gestiona seg?n el foco de cada pantalla: la m?sica de Inicio se detiene al navegar y el motor libera el audio al abandonar el juego.

## Perfiles y persistencia

`AventuraContext` es la fuente de verdad del perfil en sesi?n. Al iniciar la app, lee el perfil almacenado con AsyncStorage bajo la clave `@mundo_colorin_perfil`.

Cada perfil contiene, al menos:

```js
{
  nombre: 'Peque?o Aventurero',
  avatar: '??',
  nivelesCompletados: []
}
```

Cuando se completa un contenido, el identificador del nivel se a?ade a `nivelesCompletados` y se guarda localmente. El mapa usa esa informaci?n para decidir qu? aventuras est?n disponibles.

## Dise?o y sistema visual

El archivo `src/theme/theme.js` centraliza la identidad visual:

- `COLORS`: colores de marca, colores tem?ticos, estados, textos y superficies.
- `FONT`: familia, tama?os y pesos tipogr?ficos.
- `SPACING`: escala consistente de separaci?n.
- `RADIUS`: radios para tarjetas, botones y c?psulas.
- `SHADOW`: profundidad visual reutilizable.
- `COLOR_POR_NOMBRE` y `obtenerColorTematico`: resuelven los tonos de cada color educativo.

Las pantallas usan estos tokens en lugar de valores de color dispersos. Esto permite actualizar el estilo completo desde un ?nico lugar y mantiene coherencia entre tarjetas, botones, encabezados, estados bloqueados y modales.

## C?mo ejecutar el proyecto

### Requisitos

- Node.js LTS.
- npm.
- Expo Go para una prueba r?pida en dispositivo, cuando las capacidades utilizadas lo permitan.
- Para probar reconocimiento nativo en un dispositivo, puede ser necesario un development build, ya que incluye un m?dulo nativo.

### Instalaci?n

```bash
npm install
```

### Iniciar Expo

```bash
npm start
```
