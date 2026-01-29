import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/env';

export interface PhotoUploadMetadata {
  lat?: number;
  lng?: number;
  timestamp: string;
  deviceId: string;
  /** UUID da tarefa realizada no local/área (vincula foto à tarefa) */
  taskId?: string;
  /** Antes ou depois do serviço (ex.: faxina) */
  type?: 'BEFORE' | 'AFTER';
}

export interface PhotoUploadResult {
  url: string;
  key: string;
}

/**
 * Envia foto via multipart/form-data para POST /upload/photo.
 * Inclui metadata: lat, lng, timestamp, deviceId (e opcionalmente serviceRecordId, type).
 */
export async function uploadPhoto(
  imageUri: string,
  metadata: PhotoUploadMetadata
): Promise<PhotoUploadResult> {
  const formData = new FormData();
  const name = imageUri.split('/').pop() || `photo-${Date.now()}.jpg`;
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name,
  } as unknown as Blob);
  formData.append('timestamp', metadata.timestamp);
  formData.append('deviceId', metadata.deviceId);
  if (metadata.lat != null) formData.append('lat', String(metadata.lat));
  if (metadata.lng != null) formData.append('lng', String(metadata.lng));
  if (metadata.taskId) formData.append('taskId', metadata.taskId);
  if (metadata.type) formData.append('type', metadata.type);

  const token = await AsyncStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/upload/photo`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NÃO definir Content-Type aqui; o fetch define multipart/form-data com boundary
    } as Record<string, string>,
    body: formData,
  });

  if (!response.ok) {
    let message = 'Falha ao enviar foto.';
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text) as { message?: unknown };
        if (json?.message) {
          if (Array.isArray(json.message)) {
            message = json.message.map(String).join(', ');
          } else if (typeof json.message === 'string') {
            message = json.message;
          }
        }
      } catch {
        if (text) message = text;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(message);
  }

  const data = (await response.json()) as PhotoUploadResult;
  return data;
}
