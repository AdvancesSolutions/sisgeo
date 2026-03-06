/**
 * Minha Equipe - Status da equipe da unidade
 * Lista de subordinados com status de disponibilidade e carga do dia
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function TeamStatusScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="people" size={64} color="#F59E0B" />
        <Text style={styles.title}>Minha Equipe</Text>
        <Text style={styles.subtitle}>
          Status de todos os técnicos da sua unidade: quem está em rota, em atendimento, disponível ou offline. Carga de serviços na fila do dia.
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
