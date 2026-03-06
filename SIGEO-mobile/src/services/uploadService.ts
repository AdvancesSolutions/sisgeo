/**
 * Upload de evidências (foto antes/depois) para a AWS S3 via backend SIGEO
 * Câmera → FormData multipart → POST /upload → retorna s3Url para o gestor validar na Web
 */
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { CONFIG } from "../config";
import { authEvents } from "../utils/authEvents";

const TOKEN_KEY = "sigeo_token";

export type PhotoType = "before" | "after";

/**
 * Tira foto com a câmera e envia para o backend (AWS).
 * Retorna a URL S3 em sucesso; em falha de rede retorna a URI local (resiliente).
 * Retorna null se o utilizador cancelar ou não der permissão.
 */
export async function takePhotoAndUpload(
  taskId: string,
  type: PhotoType
): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão necessária", "O SIGEO precisa de acesso à câmera para validar o serviço.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.7,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const localUri = result.assets[0].uri;
  const filename = localUri.split("/").pop() || `evidence-${type}-${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append("photo", {
    uri: localUri,
    name: filename,
    type: "image/jpeg",
  } as unknown as Blob);
  formData.append("taskId", taskId);
  formData.append("type", type);

  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const url = `${CONFIG.API_BASE_URL.replace(/\/$/, "")}/upload`;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // Não definir Content-Type: o fetch define multipart/form-data com boundary

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401) {
      authEvents.notifyUnauthorized();
      throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

    const data = (await res.json()) as { s3Url?: string };
    if (data?.s3Url) return data.s3Url;
    throw new Error("Resposta sem s3Url");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "UNAUTHORIZED") throw e;
    Alert.alert("Falha no envio", "Não foi possível enviar a evidência. A foto ficará guardada localmente e pode ser enviada ao concluir a tarefa.");
    return localUri;
  }
}
