// Reconocimiento de voz para el navegador y para compilaciones nativas.
// En web usamos directamente Web Speech API: es el motor que Chrome/Edge
// exponen y evita que un adaptador intermedio pierda los eventos de resultado.
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

const COLORES_DE_APOYO = ['azul', 'rojo', 'amarillo'];

export function crearControladorVoz(callbacks) {
  if (Platform.OS === 'web') return crearControladorWeb(callbacks);
  return crearControladorNativo(callbacks);
}

function crearControladorWeb({
  onInicio,
  onFin,
  onError,
  onResultado,
  onVolumen,
}) {
  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const AudioContextClass = 
    typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);

  if (!SpeechRecognition) {
    throw new Error("Este navegador no soporta Web Speech API.");
  }

  let reconocimiento = null;
  let escuchando = false;
  let resultadoFinalEntregado = false;
  let stream = null;
  let audioContext = null;
  let analyser = null;
  let source = null;
  let animationId = null;
  let datos = null;

  const medirVolumen = () => {
    if (!analyser) return;

    analyser.getByteTimeDomainData(datos);
    let suma = 0;

    for (let i = 0; i < datos.length; i++) {
      const x = (datos[i] - 128) / 128;
      suma += x * x;
    }

    const rms = Math.sqrt(suma / datos.length);
    const nivel = Math.min(rms * 5, 1);

    onVolumen?.(nivel);
    animationId = requestAnimationFrame(medirVolumen);
  };

  const abrirMicrofono = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    if (!AudioContextClass) return;
    
    audioContext = new AudioContextClass();
    
    // Solución para políticas de reproducción automática en navegadores
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    datos = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    medirVolumen();
  };

  const crearReconocimiento = () => {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = "es-ES";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;
    reconocimiento.maxAlternatives = 3;

    reconocimiento.onstart = () => {
      console.log("🎤 Reconocimiento iniciado");
      escuchando = true;
      resultadoFinalEntregado = false;
      onInicio?.();
    };

    reconocimiento.onaudiostart = () => {
      console.log("🎧 Audio START");
    };

    reconocimiento.onsoundstart = () => {
      console.log("🔊 Sound START");
    };

    reconocimiento.onspeechstart = () => {
      console.log("🗣 Speech START");
    };

    reconocimiento.onresult = (evento) => {
      console.log("Resultado recibido", evento);
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        if (evento.results[i].isFinal) {
          resultadoFinalEntregado = true;
          const texto = evento.results[i][0].transcript.trim();
          console.log("✅ Texto:", texto);
          onResultado?.(texto);
          break;
        }
      }
    };

    reconocimiento.onerror = (evento) => {
      console.error("❌ Error SpeechRecognition:", evento.error);
      switch (evento.error) {
        case "not-allowed":
          onError?.("Permiso denegado.");
          break;
        case "audio-capture":
          onError?.("No se detectó micrófono.");
          break;
        case "network":
          onError?.("Error de red.");
          break;
        case "no-speech":
          onResultado?.("");
          break;
        default:
          onError?.(evento.error);
      }
    };

    reconocimiento.onend = () => {
      console.log("🛑 Reconocimiento terminado");
      escuchando = false;
      onFin?.();
      onVolumen?.(0);
      if (!resultadoFinalEntregado) {
        onResultado?.("");
      }
    };

    return reconocimiento;
  };

  return {
    iniciar: async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error("MediaDevices no soportado en este entorno.");
      }

      // Solicitud/Consulta de permisos
      try {
        const permiso = await navigator.permissions.query({
          name: "microphone",
        });
        console.log("Estado permiso:", permiso.state);
      } catch (e) {
        console.log("Consulta de permisos no soportada en este navegador, continuando...");
      }

      await abrirMicrofono();
      crearReconocimiento();
      reconocimiento.start();
    },

    detener: async () => {
      if (reconocimiento && escuchando) {
        try {
          reconocimiento.stop();
        } catch (e) {
          console.log("Error al detener reconocimiento:", e);
        }
      }

      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }

      if (source) {
        try {
          source.disconnect();
        } catch (e) {}
        source = null;
      }

      if (analyser) {
        try {
          analyser.disconnect();
        } catch (e) {}
        analyser = null;
      }

      if (audioContext) {
        try {
          await audioContext.close();
        } catch (e) {}
        audioContext = null;
      }

      onVolumen?.(0);
    },

    destruir: async () => {
      try {
        if (reconocimiento) {
          reconocimiento.onstart = null;
          reconocimiento.onresult = null;
          reconocimiento.onerror = null;
          reconocimiento.onend = null;
          reconocimiento.onspeechstart = null;
          reconocimiento.onsoundstart = null;
          reconocimiento.onaudiostart = null;

          try {
            reconocimiento.abort();
          } catch (e) {}
          reconocimiento = null;
        }

        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }

        if (source) {
          try {
            source.disconnect();
          } catch (e) {}
          source = null;
        }

        if (analyser) {
          try {
            analyser.disconnect();
          } catch (e) {}
          analyser = null;
        }

        if (audioContext) {
          try {
            await audioContext.close();
          } catch (e) {}
          audioContext = null;
        }

        onVolumen?.(0);
      } catch (error) {
        console.log("Error destruyendo controlador:", error);
      }
    },
  };
}

function crearControladorNativo({ onInicio, onFin, onError, onResultado, onVolumen }) {
  let resultadoFinalEntregado = false;
  let escuchando = false;

  const subscriptions = [
    ExpoSpeechRecognitionModule.addListener('start', () => {
      escuchando = true;
      resultadoFinalEntregado = false;
      onInicio?.();
    }),
    ExpoSpeechRecognitionModule.addListener('end', () => {
      const entregoResultado = resultadoFinalEntregado;
      escuchando = false;
      onFin?.();
      onVolumen?.(0);
      if (!entregoResultado) onResultado?.('');
    }),
    ExpoSpeechRecognitionModule.addListener('result', (evento) => {
      if (!evento.isFinal) return;
      resultadoFinalEntregado = true;
      onResultado?.(evento.results?.[0]?.transcript?.trim() || '');
    }),
    ExpoSpeechRecognitionModule.addListener('error', (evento) => {
      if (evento.error !== 'no-speech' && evento.error !== 'speech-timeout') {
        onError?.(evento.message || evento.error || 'error_reconocimiento');
      }
    }),
  ];

  return {
    iniciar: async () => {
      const permiso = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permiso.granted) throw new Error('Debes permitir el microfono y el reconocimiento de voz.');
      ExpoSpeechRecognitionModule.start({
        lang: 'es-ES',
        interimResults: true,
        continuous: false,
        maxAlternatives: 3,
        contextualStrings: COLORES_DE_APOYO,
      });
    },
    detener: async () => {
      if (escuchando) ExpoSpeechRecognitionModule.stop();
    },
    destruir: () => {
      if (escuchando) ExpoSpeechRecognitionModule.abort();
      subscriptions.forEach((subscription) => subscription.remove());
    },
  };
}