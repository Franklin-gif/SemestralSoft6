import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import { BotonMagico } from '../components/BotonMagico';

export const PanelPadresScreen = ({ navigation }) => {
  const { perfiles, estadisticas, seleccionarPerfil, perfilActivo } = useContext(AventuraContext);
  const statsNiño = perfilActivo ? estadisticas[perfilActivo.id] : null;

  const obtenerDiagnosticoColor = (datosColor) => {
    if (!datosColor || datosColor.intentosTotales === 0) return { porcentaje: 0, clase: "Aún sin explorar", color: "#999" };
    const porcentajeAcierto = Math.round((datosColor.aciertos / datosColor.intentosTotales) * 100);
    
    if (porcentajeAcierto >= 80) return { porcentaje: porcentajeAcierto, clase: "¡Excelente fortaleza! 🌟", color: "#4CAF50" };
    if (porcentajeAcierto >= 50) return { porcentaje: porcentajeAcierto, clase: "En buen progreso 👍", color: "#FFB300" };
    return { porcentaje: porcentajeAcierto, clase: "Requiere apoyo guiado 🧭", color: "#E8722C" };
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={styles.tituloPanel}>Panel de Control Familiar 🔐</Text>
        <Text style={styles.subtituloPanel}>Monitorea de forma constructiva el desarrollo e identificación de habilidades de tus hijos.</Text>
      </View>

      {/* Línea divisoria nativa (Reemplazo de <hr>) */}
      <View style={styles.lineaDivisoria} />

      {/* Sección Perfiles */}
      <Text style={styles.seccionTitulo}>1. Seleccionar Pequeño Explorador</Text>
      <View style={styles.contenedorListaPerfiles}>
        {perfiles.length === 0 ? (
          <Text style={styles.textoVacio}>No hay perfiles activos de niños.</Text>
        ) : (
          <FlatList
            data={perfiles}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const esActivo = perfilActivo?.id === item.id;
              return (
                <TouchableOpacity 
                  style={[styles.tarjetaPerfil, esActivo && styles.perfilActivoBorder]} 
                  onPress={() => seleccionarPerfil(item.id)}
                >
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                  <Text style={styles.nombreText}>{item.nombre}</Text>
                  {esActivo && <View style={styles.badgeActivo}><Text style={styles.badgeText}>Viendo</Text></View>}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Sección Reporte Analítico */}
      {perfilActivo ? (
        <View style={styles.areaReporte}>
          <Text style={styles.seccionTituloInterno}>Reporte de Desempeño: {perfilActivo.nombre}</Text>
          
          <View style={styles.resumenLogros}>
            <View style={styles.cajaLogro}>
              <Text style={styles.logroNumero}>⭐ {perfilActivo.estrellas}</Text>
              <Text style={styles.logroLabel}>Estrellas Acumuladas</Text>
            </View>
            <View style={styles.cajaLogro}>
              <Text style={styles.logroNumero}>🏅 {perfilActivo.nivelesCompletados.length}</Text>
              <Text style={styles.logroLabel}>Aventuras Superadas</Text>
            </View>
          </View>

          <Text style={styles.subSeccionTitulo}>Insignias Coleccionadas:</Text>
          <View style={styles.filaInsignias}>
            {perfilActivo.insignias.length === 0 ? (
              <Text style={styles.textoMuted}>Completará su primera aventura muy pronto.</Text>
            ) : (
              perfilActivo.insignias.map((insignia, index) => (
                <View key={index} style={styles.insigniaItem}>
                  <Text style={styles.insigniaIcono}>{insignia}</Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.subSeccionTitulo}>Comprensión y Respuestas por Temática:</Text>
          {!statsNiño || Object.keys(statsNiño).length === 0 ? (
            <Text style={styles.textoMuted}>Aún no hay interacciones de juego registradas para evaluar.</Text>
          ) : (
            Object.keys(statsNiño).map((nombreColor) => {
              const diagnostico = obtenerDiagnosticoColor(statsNiño[nombreColor]);
              return (
                <View key={nombreColor} style={styles.tarjetaStat}>
                  <View style={styles.infoStatHeader}>
                    <Text style={styles.nombreColorText}>{nombreColor}</Text>
                    <Text style={[styles.claseText, { color: diagnostico.color }]}>{diagnostico.clase}</Text>
                  </View>
                  <View style={styles.barraFondoStat}>
                    <View style={[styles.barraRellenoStat, { width: `${diagnostico.porcentaje}%`, backgroundColor: diagnostico.color }]} />
                  </View>
                  <Text style={styles.detallesStatText}>
                    Resolvió con éxito {statsNiño[nombreColor].aciertos} veces de un total de {statsNiño[nombreColor].intentosTotales} ejercicios intentados.
                  </Text>
                </View>
              );
            })
          )}
        </View>
      ) : (
        <View style={styles.alertaSeleccion}>
          <Text style={styles.textoAlerta}>Selecciona uno de los perfiles infantiles en el menú superior para desplegar sus métricas.</Text>
        </View>
      )}

      <View style={styles.areaAcciones}>
        <BotonMagico title="Regresar al Inicio" color="#2E75B6" onPress={() => navigation.navigate('MenuPrincipal')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
  header: { marginTop: 40, marginBottom: 5 },
  tituloPanel: { fontSize: 22, fontWeight: 'bold', color: '#1B365D' },
  subtituloPanel: { fontSize: 13, color: '#666', marginTop: 4, lineHeight: 18 },
  lineaDivisoria: { height: 2, backgroundColor: '#EAEAEA', marginVertical: 18 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  seccionTituloInterno: { fontSize: 16, fontWeight: 'bold', color: '#1B365D', marginBottom: 12 },
  subSeccionTitulo: { fontSize: 14, fontWeight: '700', color: '#555', marginTop: 16, marginBottom: 8 },
  contenedorListaPerfiles: { height: 110, marginBottom: 10 },
  tarjetaPerfil: { alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#FFF', borderRadius: 16, marginRight: 12, minWidth: 95, borderWidth: 2, borderColor: '#EAEAEA', position: 'relative', height: 90 },
  perfilActivoBorder: { borderColor: '#2E75B6', backgroundColor: '#F0F6FB' },
  avatarText: { fontSize: 28 },
  nombreText: { fontSize: 13, fontWeight: 'bold', color: '#444', marginTop: 2 },
  badgeActivo: { position: 'absolute', top: -5, right: -5, backgroundColor: '#2E75B6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  textoVacio: { color: '#999', fontSize: 13, marginTop: 10 },
  areaReporte: { backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginTop: 10, borderWidth: 1, borderColor: '#EAEAEA', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 2 },
  resumenLogros: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  cajaLogro: { backgroundColor: '#F9FBFD', padding: 12, borderRadius: 16, alignItems: 'center', width: '48%', borderWidth: 1, borderColor: '#EDF2F7' },
  logroNumero: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  logroLabel: { fontSize: 11, color: '#718096', marginTop: 2 },
  filaInsignias: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 4 },
  insigniaItem: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF9E6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE082' },
  insigniaIcono: { fontSize: 22 },
  textoMuted: { fontSize: 13, color: '#718096', fontStyle: 'italic' },
  tarjetaStat: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginVertical: 6, borderWidth: 1, borderColor: '#EDF2F7' },
  infoStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nombreColorText: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
  claseText: { fontSize: 12, fontWeight: 'bold' },
  barraFondoStat: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  barraRellenoStat: { height: '100%', borderRadius: 4 },
  detallesStatText: { fontSize: 11, color: '#718096', marginTop: 5 },
  alertaSeleccion: { backgroundColor: '#F7FAFC', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  textoAlerta: { color: '#718096', fontSize: 13, textAlign: 'center', lineHeight: 18 },
  areaAcciones: { marginTop: 24, alignItems: 'center' }
});