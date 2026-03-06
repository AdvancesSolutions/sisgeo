/**
 * Validações - Aprovação remota de serviços
 * Review de evidências (fotos Antes/Depois), aprovar/reprovar, notas de retrabalho (voz para texto)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function ApprovalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="checkmark-done" size={64} color="#F59E0B" />
        <Text style={styles.title}>Validações</Text>
        <Text style={styles.subtitle}>
          Galeria para revisar fotos Antes/Depois enviadas pelos técnicos. Aprovar ou reprovar com um toque. Campo de voz para texto para motivo de reprovação.
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
