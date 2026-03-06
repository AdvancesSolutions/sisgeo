import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Task, TaskStatus } from "../types/models";

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#d97706" },
  in_progress: { bg: "#dbeafe", text: "#2563eb" },
  validating: { bg: "#e0e7ff", text: "#4f46e5" },
  completed: { bg: "#d1fae5", text: "#059669" },
  rejected: { bg: "#fee2e2", text: "#dc2626" },
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em Execução",
  validating: "Validando",
  completed: "Concluída",
  rejected: "Reprovada",
};

interface TaskListProps {
  tasks: Task[];
  onPressTask: (task: Task) => void;
}

export function TaskList({ tasks, onPressTask }: TaskListProps) {
  return (
    <>
      {tasks.map((task) => {
        const cfg = STATUS_COLORS[task.status];
        const cor = task.statusColor || cfg.text;
        const bgCor = task.statusColor ? `${task.statusColor}22` : cfg.bg;
        return (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => onPressTask(task)}
            activeOpacity={0.7}
          >
            <View style={styles.taskContent}>
              <View style={styles.taskMeta}>
                <Text style={styles.taskId}>{task.id}</Text>
                <View style={[styles.statusChip, { backgroundColor: bgCor }]}>
                  <Text style={[styles.statusText, { color: cor }]}>{STATUS_LABELS[task.status]}</Text>
                </View>
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskDetails}>
                <View style={styles.taskDetail}>
                  <Ionicons name="location-outline" size={12} color="#6b7280" />
                  <Text style={styles.taskDetailText}> {task.location}</Text>
                </View>
                <View style={styles.taskDetail}>
                  <Ionicons name="time-outline" size={12} color="#6b7280" />
                  <Text style={styles.taskDetailText}> {task.scheduledAt}</Text>
                </View>
              </View>
              {task.priority === "Alta" && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="alert" size={12} color="#dc2626" />
                  <Text style={styles.priorityText}>Prioridade Alta</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskContent: { flex: 1 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  taskId: { fontSize: 10, color: "#6b7280", fontFamily: "monospace" },
  statusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: "700" },
  taskTitle: { fontSize: 14, fontWeight: "600", color: "#111" },
  taskDetails: { flexDirection: "row", gap: 12, marginTop: 6 },
  taskDetail: { flexDirection: "row", alignItems: "center" },
  taskDetailText: { fontSize: 12, color: "#6b7280" },
  priorityBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  priorityText: { fontSize: 10, color: "#dc2626", fontWeight: "700" },
});
