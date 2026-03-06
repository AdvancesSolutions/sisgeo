/**
 * Estoque - Inventário de emergência
 * Transferência de materiais entre técnicos, ajuste de saldo em campo
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function StockScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="cube" size={64} color="#F59E0B" />
        <Text style={styles.title}>Estoque</Text>
        <Text style={styles.subtitle}>
          Autorizar transferência de itens entre técnicos (ex.: disjuntor para emergência). Correção rápida de saldo em caso de quebra ou perda em campo.
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
