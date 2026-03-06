/**
 * Nova Ordem de Serviço - Gestor (Mobile)
 * Formulário simplificado: geolocalização automática, prioridade, foto de abertura, sugestão de técnico
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../services/api";

const PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "emergency", label: "Emergência" },
] as const;

type PriorityValue = (typeof PRIORITIES)[number]["value"];

interface TaskForm {
  title: string;
  description: string;
  priority: PriorityValue;
  location: { latitude: number; longitude: number } | null;
  address: string | null;
  photoUri: string | null;
}

const MANAGER_ACCENT = "#F59E0B";
const ACCENT_DARK = "#D97706";

export function CreateTaskScreen() {
  const [task, setTask] = useState<TaskForm>({
    title: "",
    description: "",
    priority: "medium",
    location: null,
    address: null,
    photoUri: null,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Ative a localização para usar esta função.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setTask((prev) => ({ ...prev, location: { latitude, longitude } }));

      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const parts = [
          geocode?.street,
          geocode?.subregion,
          geocode?.city,
          geocode?.region,
        ].filter(Boolean);
        const address = parts.length > 0 ? parts.join(", ") : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setTask((prev) => ({ ...prev, address }));
      } catch {
        setTask((prev) => ({
          ...prev,
          address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
      }
      Alert.alert("Localização capturada", "Endereço preenchido com sua posição atual.");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível obter a localização. Tente novamente.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const takeOpeningPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Ative a câmera para anexar foto de abertura.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setTask((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
    }
  };

  const handleCreate = async () => {
    const trimmedTitle = task.title.trim();
    if (!trimmedTitle) {
      Alert.alert("Campo obrigatório", "Preencha o título da ordem de serviço.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: trimmedTitle,
        description: task.description.trim() || undefined,
        priority: task.priority,
        location: task.location,
        address: task.address || undefined,
        photo_opening: task.photoUri || undefined,
      };
      await api.post<{ id: string }>("/tasks", body);
      Alert.alert("Tarefa criada", "A ordem de serviço foi lançada no sistema. O técnico mais próximo será notificado.");
      setTask({
        title: "",
        description: "",
        priority: "medium",
        location: null,
        address: null,
        photoUri: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar tarefa";
      Alert.alert("Erro", msg.includes("401") ? "Sessão expirada. Faça login novamente." : "Não foi possível criar a tarefa. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Nova Ordem de Serviço</Text>

        <Text style={styles.label}>Título da O.S. *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Manutenção ar-condicionado – Bloco B"
          placeholderTextColor="#94a3b8"
          value={task.title}
          onChangeText={(v) => setTask((prev) => ({ ...prev, title: v }))}
        />

        <Text style={styles.label}>Descrição técnica</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o problema ou serviço necessário..."
          placeholderTextColor="#94a3b8"
          value={task.description}
          onChangeText={(v) => setTask((prev) => ({ ...prev, description: v }))}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Localização</Text>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color={ACCENT_DARK} />
          ) : (
            <Ionicons name="location" size={22} color={ACCENT_DARK} />
          )}
          <Text style={styles.locationBtnText}>Usar minha localização atual</Text>
        </TouchableOpacity>
        {task.address && (
          <View style={styles.addressBox}>
            <Ionicons name="navigate" size={16} color="#64748b" />
            <Text style={styles.addressText} numberOfLines={2}>{task.address}</Text>
          </View>
        )}

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.priorityBtn, task.priority === p.value && styles.priorityBtnActive]}
              onPress={() => setTask((prev) => ({ ...prev, priority: p.value }))}
            >
              {p.value === "emergency" && <Ionicons name="warning" size={12} color={task.priority === p.value ? "#fff" : "#b45309"} />}
              <Text style={[styles.priorityLabel, task.priority === p.value && styles.priorityLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Foto de abertura</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={takeOpeningPhoto}>
          {task.photoUri ? (
            <Image source={{ uri: task.photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <Ionicons name="camera" size={32} color="#94a3b8" />
              <Text style={styles.photoBtnText}>Tirar foto do problema</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.matchBox}>
          <Ionicons name="people" size={18} color={MANAGER_ACCENT} />
          <Text style={styles.matchText}>O sistema sugerirá o técnico mais próximo com as skills adequadas após o envio.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Lançar no sistema</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { minHeight: 96, textAlignVertical: "top" },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#fcd34d",
    marginBottom: 12,
  },
  locationBtnText: { fontWeight: "700", color: "#0f172a", fontSize: 14 },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addressText: { flex: 1, fontSize: 13, color: "#475569" },
  priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  priorityBtn: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  priorityBtnActive: { backgroundColor: MANAGER_ACCENT, borderColor: ACCENT_DARK },
  priorityLabel: { fontSize: 10, fontWeight: "700", color: "#475569", textTransform: "uppercase" },
  priorityLabelActive: { color: "#fff" },
  photoBtn: {
    aspectRatio: 16 / 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e2e8f0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  photoPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  photoBtnText: { fontSize: 12, color: "#94a3b8", marginTop: 8, fontWeight: "600" },
  matchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fffbeb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  matchText: { flex: 1, fontSize: 12, color: "#78716c" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0f172a",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
