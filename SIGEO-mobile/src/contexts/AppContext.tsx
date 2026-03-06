/**
 * Contexto global do SIGEO Mobile
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "./AuthContext";
import { homeScreenTasks } from "../data/mockData";
import { useNetworkSync } from "../hooks/useNetworkSync";
import { taskService } from "../services/taskService";
import { timeclockService } from "../services/timeclockService";
import type { Task, TaskStatus } from "../types/models";

interface AppContextType {
  user: { id: string; name: string; avatar: string };
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  loadingTarefas: boolean;
  refreshingTarefas: boolean;
  fetchTarefas: () => Promise<void>;
  checkedIn: boolean;
  gpsCoords: { lat: number; lng: number } | null;
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  syncNow: () => Promise<number | undefined>;
  handleCheckIn: () => Promise<void>;
  handleStartTask: (task: Task) => Promise<void>;
  handleFinishTask: (task: Task, notes: string, checklist: boolean[], photoBefore: string, photoAfter: string, signatureData?: string) => Promise<void>;
  handleTakePhoto: (taskId: string, type: "before" | "after") => Promise<string | null>;
  handleQRScanned: (data: string) => Promise<Task | null>;
  showUserMenu: boolean;
  setShowUserMenu: (v: boolean) => void;
  showQRScanner: boolean;
  setShowQRScanner: (v: boolean) => void;
  showProfilesHelp: boolean;
  setShowProfilesHelp: (v: boolean) => void;
  scannedTask: Task | null;
  setScannedTask: (t: Task | null) => void;
  handleLogout: () => void | Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);
const MOCK_USER = { id: "USR-003", name: "João Santos", avatar: "JS" };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const [user, setUser] = useState<{ id: string; name: string; avatar: string }>(MOCK_USER);
  const [tasks, setTasks] = useState<Task[]>(homeScreenTasks);
  const [loadingTarefas, setLoadingTarefas] = useState(true);
  const [refreshingTarefas, setRefreshingTarefas] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showProfilesHelp, setShowProfilesHelp] = useState(false);
  const [scannedTask, setScannedTask] = useState<Task | null>(null);
  const pushTokenRef = React.useRef<string | null>(null);

  const { isOnline, pendingCount, syncing, syncNow, enqueue } = useNetworkSync();

  useEffect(() => {
    import("../services/pushService").then(({ pushService: ps }) => {
      ps.register().then((token) => {
        pushTokenRef.current = token;
      }).catch(() => { pushTokenRef.current = null; });
    }).catch(() => {});
  }, []);

  const fetchTarefas = useCallback(async () => {
    if (!isOnline) {
      setLoadingTarefas(false);
      setRefreshingTarefas(false);
      return;
    }
    try {
      const { dashboardService } = await import("../services/dashboardService");
      const d = await dashboardService.get();
      setTasks(d.tarefas);
      if (d.usuario) {
        setUser({ id: d.usuario.id, name: d.usuario.nome, avatar: d.usuario.iniciais || "?" });
        const token = pushTokenRef.current;
        if (token) {
          const { pushService } = await import("../services/pushService");
          pushService.sendTokenToBackend(token, d.usuario.id);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === "DEMO_MODE") {
        setTasks(homeScreenTasks);
        setUser(MOCK_USER);
      } else {
        console.warn("Erro ao carregar tarefas:", e);
      }
    } finally {
      setLoadingTarefas(false);
      setRefreshingTarefas(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setLoadingTarefas(false);
      return;
    }
    fetchTarefas();
  }, [isOnline, fetchTarefas]);

  const handleCheckIn = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = -23.5505, lng = -46.6333;
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      setGpsCoords({ lat, lng });
      setCheckedIn(true);
      const payload = { lat, lng, timestamp: new Date().toISOString() };
      if (isOnline) {
        try { await timeclockService.checkin(payload); } catch { await enqueue("checkin", payload); }
      } else {
        await enqueue("checkin", payload);
      }
    } catch {
      setGpsCoords({ lat: -23.5505, lng: -46.6333 });
      setCheckedIn(true);
    }
  }, [isOnline, enqueue]);

  const handleStartTask = useCallback(async (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "in_progress" as TaskStatus } : t)));
    const payload = { taskId: task.id, status: "in_progress" as const, atualizado_via_mobile_em: new Date().toISOString() };
    if (isOnline) {
      try { await taskService.updateStatus(task.id, "in_progress"); } catch { await enqueue("task_update", payload); }
    } else {
      await enqueue("task_update", payload);
    }
  }, [isOnline, enqueue]);

  const handleFinishTask = useCallback(async (
    selectedTask: Task,
    notes: string,
    checklistState: boolean[],
    photoBefore: string,
    photoAfter: string,
    signatureData?: string
  ) => {
    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "validating" as TaskStatus } : t)));
    const payload = { taskId: selectedTask.id, notes, checklist: checklistState, photoBefore, photoAfter, signatureData, atualizado_via_mobile_em: new Date().toISOString() };
    if (isOnline) {
      try {
        await taskService.finish(selectedTask.id, { notes, checklist: checklistState, photoBefore, photoAfter, signatureData });
      } catch {
        await enqueue("task_finish", payload);
      }
    } else {
      await enqueue("task_finish", payload);
    }
  }, [isOnline, enqueue]);

  const handleTakePhoto = useCallback(async (taskId: string, type: "before" | "after"): Promise<string | null> => {
    try {
      const { takePhotoAndUpload } = await import("../services/uploadService");
      return await takePhotoAndUpload(taskId, type);
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") throw e;
      return null;
    }
  }, []);

  const handleQRScanned = useCallback(async (data: string): Promise<Task | null> => {
    const code = data.trim().toUpperCase();
    const found = tasks.find((t) => t.id === code);
    if (found) return found;
    try {
      const task = await taskService.getByQrCode(code);
      if (task) { setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [...prev, task])); return task; }
    } catch { Alert.alert("QR Code", `Nenhuma tarefa para: ${code}`); }
    return null;
  }, [tasks]);

  const handleLogout = useCallback(async () => {
    setTasks(homeScreenTasks);
    setCheckedIn(false);
    setGpsCoords(null);
    setShowUserMenu(false);
    setShowQRScanner(false);
    setShowProfilesHelp(false);
    setScannedTask(null);
    await signOut();
  }, [signOut]);

  const handleRefreshTarefas = useCallback(async () => {
    setRefreshingTarefas(true);
    await fetchTarefas();
  }, [fetchTarefas]);

  return (
    <AppContext.Provider
      value={{
        user,
        tasks,
        setTasks,
        loadingTarefas,
        refreshingTarefas,
        fetchTarefas: handleRefreshTarefas,
        checkedIn,
        gpsCoords,
        isOnline,
        pendingCount,
        syncing,
        syncNow,
        handleCheckIn,
        handleStartTask,
        handleFinishTask,
        handleTakePhoto,
        handleQRScanned,
        showUserMenu,
        setShowUserMenu,
        showQRScanner,
        setShowQRScanner,
        showProfilesHelp,
        setShowProfilesHelp,
        scannedTask,
        setScannedTask,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
