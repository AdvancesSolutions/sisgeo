/**
 * Mapa Live - Visão geral da equipe em tempo real
 * Mapa de calor com posição GPS dos técnicos, status de disponibilidade e carga de serviços
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="map" size={64} color="#F59E0B" />
        <Text style={styles.title}>Mapa Live</Text>
        <Text style={styles.subtitle}>
          Visualização de onde cada técnico está (último sinal GPS). Status: Em Rota, Em Atendimento, Disponível ou Offline. Indicador de carga por técnico.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 20 },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 16 },
  subtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 12, lineHeight: 20 },
});
