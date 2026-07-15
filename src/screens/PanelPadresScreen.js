import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { AventuraContext } from '../context/AventuraContext';
import { BotonMagico } from '../components/BotonMagico';
import { COLORS, FONT, SPACING, RADIUS, SHADOW } from '../theme/theme';

export const PanelPadresScreen = ({ navigation }) => {
  const { perfiles = [], estadisticas = {}, seleccionarPerfil, perfilActivo } = useContext(AventuraContext);
  const statsNiño = perfilActivo ? estadisticas[perfilActivo.id] : null;

  const obtenerDiagnosticoColor = (datosColor) => {
    if (!datosColor || datosColor.intentosTotales === 0) return { porcentaje: 0, clase: 'Aún sin explorar', color: COLORS.textoMuted };
    const porcentajeAcierto = Math.round((datosColor.aciertos / datosColor.intentosTotales) * 100);

    if (porcentajeAcierto >= 80) return { porcentaje: porcentajeAcierto, clase: '¡Excelente fortaleza! 🌟', color: COLORS.exito };
    if (porcentajeAcierto >= 50) return { porcentaje: porcentajeAcierto, clase: 'En buen progreso 👍', color: COLORS.advertencia };
    return { porcentaje: porcentajeAcierto, clase: 'Requiere apoyo guiado 🧭', color: COLORS.error };
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={styles.tituloPanel}>Panel de Control Familiar 🔐</Text>
        <Text style={styles.subtituloPanel}>Monitorea de forma constructiva el desarrollo e identificación de habilidades de tus hijos.</Text>
      </View>

      <View style={styles.lineaDivisoria} />

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
                  onPress={() => seleccionarPerfil && seleccionarPerfil(item.id)}
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

      {perfilActivo ? (
        <View style={styles.areaReporte}>
          <Text style={styles.seccionTituloInterno}>Reporte de Desempeño: {perfilActivo.nombre}</Text>

          <View style={styles.resumenLogros}>
            <View style={styles.cajaLogro}>
              <Text style={styles.logroNumero}>⭐ {perfilActivo.estrellas}</Text>
              <Text style={styles.logroLabel}>Estrellas Acumuladas</Text>
            </View>
            <View style={styles.cajaLogro}>
              <Text style={styles.logroNumero}>🏅 {(perfilActivo.nivelesCompletados || []).length}</Text>
              <Text style={styles.logroLabel}>Aventuras Superadas</Text>
            </View>
          </View>

          <Text style={styles.subSeccionTitulo}>Insignias Coleccionadas:</Text>
          <View style={styles.filaInsignias}>
            {(perfilActivo.insignias || []).length === 0 ? (
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
        <BotonMagico title="Regresar al Inicio" color={COLORS.primary} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'SelectorPerfil' }] })} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.fondo, padding: SPACING.md },
  header: { marginTop: 40, marginBottom: SPACING.xs },
  tituloPanel: { fontSize: FONT.size.xxl, fontWeight: FONT.weight.bold, color: COLORS.primaryDark },
  subtituloPanel: { fontSize: FONT.size.xs, color: COLORS.textoMuted, marginTop: SPACING.xs, lineHeight: 18 },
  lineaDivisoria: { height: 2, backgroundColor: COLORS.bordeSuave, marginVertical: SPACING.lg },
  seccionTitulo: { fontSize: FONT.size.md, fontWeight: FONT.weight.bold, color: COLORS.texto, marginBottom: SPACING.md },
  seccionTituloInterno: { fontSize: FONT.size.md, fontWeight: FONT.weight.bold, color: COLORS.primaryDark, marginBottom: SPACING.md },
  subSeccionTitulo: { fontSize: FONT.size.sm, fontWeight: FONT.weight.bold, color: COLORS.textoSecundario, marginTop: SPACING.md, marginBottom: SPACING.sm },
  contenedorListaPerfiles: { height: 110, marginBottom: SPACING.sm },
  tarjetaPerfil: { alignItems: 'center', justifyContent: 'center', padding: SPACING.sm, backgroundColor: COLORS.superficie, borderRadius: RADIUS.md, marginRight: SPACING.md, minWidth: 95, borderWidth: 2, borderColor: COLORS.bordeSuave, position: 'relative', height: 90 },
  perfilActivoBorder: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  avatarText: { fontSize: 28 },
  nombreText: { fontSize: FONT.size.sm, fontWeight: FONT.weight.bold, color: COLORS.texto, marginTop: 2 },
  badgeActivo: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.sm },
  badgeText: { color: COLORS.textoClaro, fontSize: 9, fontWeight: FONT.weight.bold },
  textoVacio: { color: COLORS.textoMuted, fontSize: FONT.size.sm, marginTop: SPACING.sm },
  areaReporte: { backgroundColor: COLORS.superficie, padding: SPACING.md, borderRadius: RADIUS.xl, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.bordeSuave, ...SHADOW.sm },
  resumenLogros: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
  cajaLogro: { backgroundColor: COLORS.fondo, padding: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center', width: '48%', borderWidth: 1, borderColor: COLORS.bordeSuave },
  logroNumero: { fontSize: FONT.size.lg, fontWeight: FONT.weight.bold, color: COLORS.texto },
  logroLabel: { fontSize: 11, color: COLORS.textoMuted, marginTop: 2 },
  filaInsignias: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.xs },
  insigniaItem: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.superficieAlerta, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.bordeAlerta },
  insigniaIcono: { fontSize: 22 },
  textoMuted: { fontSize: FONT.size.sm, color: COLORS.textoMuted, fontStyle: 'italic' },
  tarjetaStat: { backgroundColor: COLORS.superficieSuave, padding: SPACING.sm, borderRadius: RADIUS.md, marginVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.bordeSuave },
  infoStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  nombreColorText: { fontSize: FONT.size.sm, fontWeight: FONT.weight.bold, color: COLORS.texto },
  claseText: { fontSize: 12, fontWeight: FONT.weight.bold },
  barraFondoStat: { height: 8, backgroundColor: COLORS.bordeSuave, borderRadius: 4, overflow: 'hidden' },
  barraRellenoStat: { height: '100%', borderRadius: 4 },
  detallesStatText: { fontSize: 11, color: COLORS.textoMuted, marginTop: 5 },
  alertaSeleccion: { backgroundColor: COLORS.superficieSuave, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.bordeSuave },
  textoAlerta: { color: COLORS.textoMuted, fontSize: FONT.size.sm, textAlign: 'center', lineHeight: 18 },
  areaAcciones: { marginTop: SPACING.lg, alignItems: 'center' },
});

export default PanelPadresScreen;