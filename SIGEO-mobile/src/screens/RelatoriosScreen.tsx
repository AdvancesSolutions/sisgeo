/**
 * Tela Relatórios - Em breve
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function RelatoriosScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="bar-chart-outline" size={64} color="#9ca3af" />
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>Em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff", paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 16 },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8 },
});
