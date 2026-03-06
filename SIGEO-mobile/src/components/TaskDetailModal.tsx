import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SignaturePadModal } from "./SignaturePadModal";
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

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onStartTask: (task: Task) => Promise<void>;
  onFinishTask: (task: Task, notes: string, checklist: boolean[], photoBefore: string, photoAfter: string, signatureData?: string) => Promise<void>;
  onTakePhoto: (taskId: string, type: "before" | "after") => Promise<string | null>;
}

export function TaskDetailModal({ task, onClose, onStartTask, onFinishTask, onTakePhoto }: TaskDetailModalProps) {
  const [notes, setNotes] = useState("");
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<boolean[]>([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const checklist = task?.checklist ?? [];
  useEffect(() => {
    if (!task) return;
    setChecklistState(checklist.map(() => false));
    setNotes("");
    setPhotoBefore(null);
    setPhotoAfter(null);
  }, [task?.id]);

  if (!task) return null;

  const cfg = STATUS_COLORS[task.status];

  const toggleChecklist = (i: number) => {
    setChecklistState((prev) => prev.map((v, j) => (j === i ? !v : v)));
  };

  const handleTakePhoto = async (type: "before" | "after") => {
    const uri = await onTakePhoto(task.id, type);
    if (uri) type === "before" ? setPhotoBefore(uri) : setPhotoAfter(uri);
  };

  const handleRequestFinish = () => {
    if (!photoBefore || !photoAfter) {
      Alert.alert("Fotos obrigatórias", "Capture foto ANTES e DEPOIS.");
      return;
    }
    setShowSignaturePad(true);
  };

  const handleSignatureConfirm = async (signatureData: string) => {
    if (!photoBefore || !photoAfter) return;
    await onFinishTask(task, notes, checklistState, photoBefore, photoAfter, signatureData);
    setShowSignaturePad(false);
    onClose();
  };

  return (
    <Modal visible={!!task} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.meta}>
              <Text style={styles.taskId}>{task.id}</Text>
              <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.text }]}>{STATUS_LABELS[task.status]}</Text>
              </View>
            </View>
            <Text style={styles.title}>{task.title}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValue}>📍 {task.location}</Text>
              <Text style={styles.infoSub}>{task.area}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Horário / SLA</Text>
              <Text style={styles.infoValue}>🕐 {task.scheduledAt}</Text>
              <Text style={styles.infoSub}>SLA: {task.sla}</Text>
            </View>
          </View>

          {task.description && (
            <View style={styles.descCard}>
              <Text style={styles.infoLabel}>Descrição</Text>
              <Text style={styles.descText}>{task.description}</Text>
            </View>
          )}

          {checklist.length > 0 && (
            <View style={styles.checklistCard}>
              <Text style={styles.infoLabel}>Checklist de Execução</Text>
              {checklist.map((item, i) => (
                <TouchableOpacity key={i} style={styles.checklistItem} onPress={() => toggleChecklist(i)}>
                  <Ionicons
                    name={checklistState[i] ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={checklistState[i] ? "#059669" : "#9ca3af"}
                  />
                  <Text style={[styles.checklistText, checklistState[i] && styles.checklistDone]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.photosCard}>
            <Text style={styles.infoLabel}>Evidências Fotográficas (S3)</Text>
            <View style={styles.photosRow}>
              <View style={styles.photoBox}>
                <Text style={styles.photoLabel}>Antes</Text>
                {photoBefore ? (
                  <Image source={{ uri: photoBefore }} style={styles.photoImg} />
                ) : (
                  <TouchableOpacity style={[styles.photoBtn, styles.photoBtnBefore]} onPress={() => handleTakePhoto("before")}>
                    <Ionicons name="camera" size={24} color="#0f172a" />
                    <Text style={styles.photoBtnTextBefore}>Foto Antes</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.photoBox}>
                <Text style={styles.photoLabel}>Depois</Text>
                {photoAfter ? (
                  <Image source={{ uri: photoAfter }} style={styles.photoImg} />
                ) : (
                  <TouchableOpacity style={[styles.photoBtn, styles.photoBtnAfter]} onPress={() => handleTakePhoto("after")}>
                    <Ionicons name="camera" size={24} color="#F59E0B" />
                    <Text style={styles.photoBtnTextAfter}>Foto Depois</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.infoLabel}>Observações do Técnico</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Descreva o serviço realizado..."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.actions}>
            {task.status === "pending" ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => onStartTask(task)}>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Iniciar Tarefa</Text>
              </TouchableOpacity>
            ) : task.status === "in_progress" ? (
              <TouchableOpacity style={[styles.primaryBtn, styles.successBtn]} onPress={handleRequestFinish}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Finalizar e Enviar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.outlineBtn} onPress={onClose}>
                <Text style={styles.outlineBtnText}>Voltar às Tarefas</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      <SignaturePadModal
        visible={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onConfirm={handleSignatureConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: Platform.OS === "ios" ? 48 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  taskId: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" },
  statusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: "700" },
  title: { fontSize: 18, color: "#fff", fontWeight: "700" },
  infoRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginTop: 16 },
  infoCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  infoLabel: { fontSize: 10, color: "#6b7280", fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111" },
  infoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  descCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  descText: { fontSize: 14, color: "#374151", marginTop: 4 },
  checklistCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  checklistItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  checklistText: { fontSize: 14, color: "#111", flex: 1 },
  checklistDone: { color: "#6b7280", textDecorationLine: "line-through" },
  photosCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  photosRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  photoBox: { flex: 1 },
  photoLabel: { fontSize: 10, color: "#6b7280", fontWeight: "700", marginBottom: 6 },
  photoBtn: { aspectRatio: 16 / 9, borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 12 },
  photoBtnBefore: { backgroundColor: "#e2e8f0", borderWidth: 2, borderColor: "#cbd5e1" },
  photoBtnAfter: { backgroundColor: "#0f172a", borderWidth: 2, borderColor: "#1e293b" },
  photoImg: { aspectRatio: 1, borderRadius: 12, resizeMode: "cover" },
  photoBtnTextBefore: { fontSize: 10, color: "#0f172a", marginTop: 6, fontWeight: "700", textTransform: "uppercase" },
  photoBtnTextAfter: { fontSize: 10, color: "#fff", marginTop: 6, fontWeight: "700", textTransform: "uppercase" },
  notesCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  notesInput: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
  actions: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  primaryBtn: { backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successBtn: { backgroundColor: "#059669" },
  outlineBtn: { borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", paddingVertical: 16, borderRadius: 12 },
  outlineBtnText: { color: "#374151", fontSize: 16, fontWeight: "600" },
});
