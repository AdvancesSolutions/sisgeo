/**
 * Modais globais: Menu usuário, QR Scanner e Perfis/Opções
 * Overlay TouchableOpacity permite fechar ao clicar fora
 */
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { QRScanner } from "./QRScanner";

export function AppModals() {
  const { showUserMenu, setShowUserMenu, showQRScanner, setShowQRScanner, showProfilesHelp, setShowProfilesHelp, handleQRScanned, setScannedTask, handleLogout } = useApp();
  const { userProfile } = useAuth();
  const role = userProfile?.role ?? "technician";
  const roleLabel = role === "super_admin" ? "Admin" : role === "manager" ? "Gestor" : "Técnico";

  const onQRScanned = async (data: string) => {
    const task = await handleQRScanned(data);
    setShowQRScanner(false);
    if (task) setScannedTask(task);
  };

  return (
    <>
      <Modal visible={showUserMenu} transparent animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.menuContainer}>
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowUserMenu(false)}>
                <Ionicons name="person-outline" size={20} color="#555" />
                <Text style={styles.menuText}>Meu Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemHighlight]}
                onPress={() => { setShowUserMenu(false); setShowProfilesHelp(true); }}
              >
                <Ionicons name="people-outline" size={20} color="#2563eb" />
                <Text style={[styles.menuText, styles.menuTextHighlight]}>Perfis e opções</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowUserMenu(false)}>
                <Ionicons name="settings-outline" size={20} color="#555" />
                <Text style={styles.menuText}>Configurações</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowUserMenu(false)}>
                <Ionicons name="help-circle-outline" size={20} color="#555" />
                <Text style={styles.menuText}>Central de Ajuda</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowUserMenu(false); setShowQRScanner(true); }}>
                <Ionicons name="qr-code-outline" size={20} color="#555" />
                <Text style={styles.menuText}>Escanear QR Code</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={async () => {
                  setShowUserMenu(false);
                  await handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF5252" />
                <Text style={[styles.menuText, styles.menuTextLogout]}>Sair</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showQRScanner} animationType="slide" onRequestClose={() => setShowQRScanner(false)}>
        <View style={styles.qrContainer}>
          <QRScanner onScan={onQRScanned} onClose={() => setShowQRScanner(false)} />
        </View>
      </Modal>

      <Modal visible={showProfilesHelp} transparent animationType="fade" onRequestClose={() => setShowProfilesHelp(false)}>
        <TouchableOpacity style={styles.profilesOverlay} activeOpacity={1} onPress={() => setShowProfilesHelp(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.profilesCard}>
            <View style={styles.profilesHeader}>
              <Text style={styles.profilesTitle}>Perfis e opções no app</Text>
              <TouchableOpacity onPress={() => setShowProfilesHelp(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.profilesBadge}>
              <Ionicons name="person-circle" size={18} color="#2563eb" />
              <Text style={styles.profilesBadgeText}>Você está como: {roleLabel}</Text>
            </View>
            <ScrollView style={styles.profilesScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.profilesSectionTitle}>Técnico</Text>
              <Text style={styles.profilesBody}>
                Abas: Início, Tarefas, Ação Rápida (centro), Relatórios, Suporte. Pode fazer check-in, ver e executar tarefas, enviar fotos antes/depois e assinatura do cliente. Não cria novas O.S.
              </Text>
              <Text style={styles.profilesSectionTitle}>Gestor / Admin</Text>
              <Text style={styles.profilesBody}>
                Abas: Mapa Live, Nova O.S. (adicionar tarefa), Validações, Minha Equipe, Estoque. Aqui ficam criar tarefa, validar evidências e gestão da equipe.
              </Text>
              <Text style={styles.profilesHint}>
                Para ver as opções de Gestor/Admin (incluindo adicionar tarefa), faça login com um desses perfis na tela de login — use os botões "Gestor" ou "Admin" na seção "Testar perfis (mock API)" ou entre com usuário gestor/admin na API real.
              </Text>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 88,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 8,
    width: 200,
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuScroll: { maxHeight: 340 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  menuItemHighlight: { backgroundColor: "#eff6ff" },
  menuTextHighlight: { color: "#2563eb", fontWeight: "600" },
  menuTextLogout: {
    color: "#FF5252",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 5,
  },
  qrContainer: { flex: 1, backgroundColor: "#000" },
  profilesOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  profilesCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    maxHeight: "80%",
    padding: 20,
  },
  profilesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profilesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  profilesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  profilesBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  profilesScroll: { maxHeight: 320 },
  profilesSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
    marginBottom: 4,
  },
  profilesBody: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 4,
  },
  profilesHint: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 8,
    fontStyle: "italic",
  },
});
