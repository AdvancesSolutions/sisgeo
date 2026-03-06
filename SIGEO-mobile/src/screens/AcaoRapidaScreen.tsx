/**
 * Tela Ação Rápida - Acesso pelo botão central da Tab Bar
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../contexts/AppContext";

export function AcaoRapidaScreen() {
  const { setShowQRScanner } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ação Rápida</Text>
      <Text style={styles.subtitle}>Escolha uma opção</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowQRScanner(true)}>
          <Ionicons name="qr-code" size={32} color="#2563eb" />
          <Text style={styles.actionLabel}>Escanear QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 24, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 32 },
  actions: { gap: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionLabel: { fontSize: 16, fontWeight: "600", color: "#334155" },
});
