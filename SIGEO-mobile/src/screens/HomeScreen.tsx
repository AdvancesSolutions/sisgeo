/**
 * Tela Início - Dashboard com header animado "tipo banco"
 * Header encolhe e detalhes somem ao rolar para cima
 */
import React, { useState, useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../contexts/AppContext";
import { TaskList } from "../components/TaskList";
import { TaskDetailModal } from "../components/TaskDetailModal";
import type { Task } from "../types/models";

const HEADER_EXPANDED = 180;
const HEADER_COLLAPSED = 72;
const SCROLL_RANGE = 100;

export function HomeScreen() {
  const {
    user,
    tasks,
    checkedIn,
    handleCheckIn,
    handleStartTask,
    handleFinishTask,
    handleTakePhoto,
    setShowUserMenu,
    setShowProfilesHelp,
    scannedTask,
    setScannedTask,
  } = useApp();

  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const isFocused = useIsFocused();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [HEADER_EXPANDED, HEADER_COLLAPSED],
    extrapolate: "clamp",
  });

  const headerDetailsOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (isFocused && scannedTask) {
      setSelectedTask(scannedTask);
      setScannedTask(null);
    }
  }, [isFocused, scannedTask]);

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const onCheckIn = async () => {
    setGpsLoading(true);
    await handleCheckIn();
    setGpsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerSubtitle}>SIGEO Mobile</Text>
          <TouchableOpacity style={styles.avatar} onPress={() => setShowUserMenu(true)}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.headerDetails, { opacity: headerDetailsOpacity }]}>
          <Text style={styles.headerTitle}>Olá, {user.name.split(" ")[0]} 👋</Text>
          <Text style={styles.statusText}>{checkedIn ? "Check-in realizado" : "Registre seu ponto"}</Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <TouchableOpacity
          style={[styles.checkinPill, checkedIn && styles.checkinPillOk]}
          onPress={onCheckIn}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name={checkedIn ? "checkmark" : "paper-plane-outline"} size={18} color="#fff" />
          )}
          <Text style={styles.checkinPillText}>
            {checkedIn ? "Check-in realizado" : "Registre seu ponto"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.perfisCard} onPress={() => setShowProfilesHelp(true)} activeOpacity={0.8}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <View style={styles.perfisCardText}>
            <Text style={styles.perfisCardTitle}>Adicionar tarefas e outras opções?</Text>
            <Text style={styles.perfisCardSub}>Toque para ver perfis (Técnico, Gestor, Admin) e onde fica cada opção.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso do Dia</Text>
            <Text style={styles.progressValue}>{completedCount}/{tasks.length}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Minhas Tarefas ({tasks.length})</Text>
        <TaskList tasks={tasks} onPressTask={(t) => setSelectedTask(t)} />
      </Animated.ScrollView>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStartTask={async (t) => {
          await handleStartTask(t);
          setSelectedTask((prev) => (prev?.id === t.id ? { ...prev, status: "in_progress" } : prev));
        }}
        onFinishTask={handleFinishTask}
        onTakePhoto={handleTakePhoto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 48 : 40,
    zIndex: 1000,
    overflow: "hidden",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerSubtitle: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "700", letterSpacing: 2 },
  headerDetails: { marginTop: 4 },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  statusText: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "400" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#60a5fa", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: HEADER_EXPANDED + 20, paddingBottom: 100 },
  checkinPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  checkinPillOk: { backgroundColor: "#059669" },
  checkinPillText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  progressCard: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 11, color: "#6b7280", fontWeight: "700", letterSpacing: 1 },
  progressValue: { fontSize: 14, color: "#111", fontWeight: "700" },
  progressBar: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563eb", borderRadius: 4 },
  perfisCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 12,
  },
  perfisCardText: { flex: 1 },
  perfisCardTitle: { fontSize: 14, fontWeight: "700", color: "#1e40af" },
  perfisCardSub: { fontSize: 12, color: "#3b82f6", marginTop: 2 },
  sectionTitle: { fontSize: 12, color: "#6b7280", fontWeight: "700", letterSpacing: 1, marginTop: 20, marginBottom: 8 },
});
