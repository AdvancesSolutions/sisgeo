/**
 * Ponto / Check-in
 * Geolocalização enviada para o mapa de monitoramento no SIGEO Web
 */
import { api } from "./api";

export interface CheckinPayload {
  lat: number;
  lng: number;
  timestamp: string;
}

export const timeclockService = {
  async checkin(payload: CheckinPayload): Promise<void> {
    await api.post("/timeclock/checkin", payload);
  },
};
