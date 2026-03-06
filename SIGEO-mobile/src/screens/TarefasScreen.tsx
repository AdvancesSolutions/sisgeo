/**
 * Tela Tarefas - Dados da API SIGEO Web
 * GET /dashboard -> tarefas mapeadas para os cartões
 * Pull-to-refresh; abre detalhe ao toque na notificação push (openTaskId)
 */
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { useIsFocused, useRoute, useNavigation } from "@react-navigation/native";
import { useApp } from "../contexts/AppContext";
import { TaskList } from "../components/TaskList";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { taskService } from "../services/taskService";
import type { Task } from "../types/models";

type TarefasRouteParams = { openTaskId?: string };

export function TarefasScreen() {
  const { tasks, loadingTarefas, refreshingTarefas, fetchTarefas, handleStartTask, handleFinishTask, handleTakePhoto, scannedTask, setScannedTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const isFocused = useIsFocused();
  const route = useRoute();
  const navigation = useNavigation();
  const openTaskId = (route.params as TarefasRouteParams | undefined)?.openTaskId;

  useEffect(() => {
    if (isFocused && scannedTask) {
      setSelectedTask(scannedTask);
      setScannedTask(null);
    }
  }, [isFocused, scannedTask]);

  useEffect(() => {
    if (!isFocused || !openTaskId) return;
    const openTask = async () => {
      const found = tasks.find((t) => t.id === openTaskId);
      if (found) {
        setSelectedTask(found);
      } else {
        try {
          const task = await taskService.getById(openTaskId);
          setSelectedTask(task);
        } catch (e) {
          if (e instanceof Error && e.message === "DEMO_MODE") {
            const found = tasks.find((t) => t.id === openTaskId);
            if (found) setSelectedTask(found);
          } else {
            setSelectedTask(null);
          }
        }
      }
      (navigation as unknown as { setParams: (p: TarefasRouteParams) => void }).setParams({ openTaskId: undefined });
    };
    openTask();
  }, [isFocused, openTaskId, tasks, navigation]);

  if (loadingTarefas) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} tarefas</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskList tasks={[item]} onPressTask={(t) => setSelectedTask(t)} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma tarefa no momento</Text>
            <Text style={styles.emptyHint}>Arraste para baixo para atualizar</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshingTarefas} onRefresh={fetchTarefas} colors={["#2196F3"]} tintColor="#2196F3" />
        }
      />

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
  container: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", gap: 12 },
  loadingText: { fontSize: 14, color: "#6b7280" },
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },
  emptyContainer: { paddingVertical: 40, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, color: "#6b7280" },
  emptyHint: { fontSize: 13, color: "#9ca3af" },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: Platform.OS === "ios" ? 48 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
});
