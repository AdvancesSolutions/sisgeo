/**
 * Tela de Login - SIGEO Mobile
 * Após login, token salvo no SecureStore para persistência
 */
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Erro", "Preencha email e senha.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      let user = data?.user;
      if (!user && data?.token) {
        try { user = await authService.me(); } catch { /* ignore */ }
      }
      await signIn(data.token, user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao fazer login";
      if (msg === "API Error 401" || msg.includes("401")) {
        Alert.alert("Login inválido", "Email ou senha incorretos.");
      } else {
        Alert.alert("Erro", "Não foi possível conectar. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDemoUser = (email: string): { id: string; email: string; name: string; role: "super_admin" | "manager" | "technician" } => {
    const role =
      email.includes("admin") ? "super_admin"
      : email.includes("gestor") ? "manager"
      : "technician";
    const name = role === "super_admin" ? "Admin (demo)" : role === "manager" ? "Gestor (demo)" : "Técnico (demo)";
    return { id: "demo-1", email, name, role };
  };

  const handleProfileLogin = async (email: string, _label?: string) => {
    setLoading(true);
    try {
      const data = await authService.login(email, "demo123", { timeoutMs: 10000 });
      let user = data?.user;
      if (!user && data?.token) {
        try { user = await authService.me(); } catch { /* ignore */ }
      }
      await signIn(data.token, user);
    } catch {
      try {
        const demoUser = getDemoUser(email);
        const demoToken = `demo-${demoUser.role}-${Date.now()}`;
        await signIn(demoToken, demoUser);
      } catch {
        Alert.alert(
          "Sem conexão",
          "Não foi possível conectar ao servidor (timeout ou servidor indisponível). Tente de novo ou use o login com email e senha se o backend estiver no ar."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => handleProfileLogin("tecnico@sigeo.com.br", "Técnico");

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SIGEO Mobile</Text>
            <Text style={styles.subtitle}>Sistema Integrado de Gestão Operacional</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.profilesSection}>
              <Text style={styles.profilesLabel}>Para adicionar tarefas: entre como Gestor ou Admin</Text>
              <Text style={styles.profilesHint}>Use os botões abaixo. O mock deve estar rodando (npm run server na pasta server).</Text>
              <View style={styles.profileRow}>
                <TouchableOpacity style={styles.profileBtn} onPress={() => handleProfileLogin("tecnico@sigeo.com.br", "Técnico")} disabled={loading}>
                  <Ionicons name="construct-outline" size={18} color="#fff" />
                  <Text style={styles.profileBtnText}>Técnico</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.profileBtn, styles.profileBtnManager]} onPress={() => handleProfileLogin("gestor@sigeo.com.br", "Gestor")} disabled={loading}>
                  <Ionicons name="people-outline" size={18} color="#fff" />
                  <Text style={styles.profileBtnText}>Gestor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.profileBtn, styles.profileBtnAdmin]} onPress={() => handleProfileLogin("admin@sigeo.com.br", "Admin")} disabled={loading}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                  <Text style={styles.profileBtnText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2196F3" },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  content: { paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", marginTop: 8 },
  form: { gap: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  profilesSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  profilesLabel: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  profilesHint: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 12, textAlign: "center", paddingHorizontal: 8 },
  profileRow: { flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap" },
  profileBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  profileBtnManager: { backgroundColor: "rgba(245,158,11,0.9)" },
  profileBtnAdmin: { backgroundColor: "rgba(15,23,42,0.9)" },
  profileBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", marginTop: 4 },
});
