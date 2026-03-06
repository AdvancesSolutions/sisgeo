import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pushService } from "@/services/pushService";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/contexts/AuthContext";
import { mockTasks } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin, Clock, CheckCircle, Circle, Camera, Navigation,
  ChevronRight, ArrowLeft, User, Zap, Shield, Phone,
  AlertTriangle, Check, X, Loader2, Image, Wifi, WifiOff, RefreshCw, Monitor,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, TaskStatus } from "@/types/models";

type MobileView = "list" | "detail" | "checkin" | "photo" | "checklist";

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof Circle }> = {
  pending: { label: "Pendente", color: "bg-warning/15 text-warning", icon: Clock },
  in_progress: { label: "Em Execução", color: "bg-primary/15 text-primary", icon: Zap },
  validating: { label: "Validando", color: "bg-accent/15 text-accent", icon: Shield },
  completed: { label: "Concluída", color: "bg-success/15 text-success", icon: CheckCircle },
  rejected: { label: "Reprovada", color: "bg-danger/15 text-danger", icon: X },
};

const TechnicianMobile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline, pendingCount, syncing, enqueue, syncNow } = useOfflineSync();
  const [view, setView] = useState<MobileView>("list");
  const [tasks, setTasks] = useState<Task[]>(
    mockTasks.filter((t) => t.assignee === "João Santos" || t.assignee === "Maria Silva").slice(0, 5)
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [checklistState, setChecklistState] = useState<boolean[]>([]);

  // Push notifications setup
  useEffect(() => {
    const initPush = async () => {
      const token = await pushService.register();
      if (token) {
        await pushService.sendTokenToBackend(token, user.id);
      }
      pushService.setupListeners((data) => {
        // Se a notificação contém um taskId, abre a tarefa
        if (data.taskId) {
          const task = tasks.find((t) => t.id === data.taskId);
          if (task) handleOpenTask(task);
        }
      });
    };
    initPush();
    return () => pushService.removeAllListeners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const todayTasks = tasks;
  const completedCount = todayTasks.filter((t) => t.status === "completed").length;

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setChecklistState((task.checklist || []).map(() => false));
    setPhotoBefore(null);
    setPhotoAfter(null);
    setNotes("");
    setView("detail");
  };

  const handleCheckIn = async () => {
    setGpsLoading(true);
    try {
      let lat = -23.5505;
      let lng = -46.6333;

      try {
        const { nativeGPS } = await import("@/services/nativeFeatures");
        const pos = await nativeGPS.getCurrentPosition();
        lat = pos.lat;
        lng = pos.lng;
      } catch {
        if ("geolocation" in navigator) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      }

      setGpsCoords({ lat, lng });
      setCheckedIn(true);
      enqueue("checkin", { lat, lng, timestamp: new Date().toISOString() });
      toast({ title: "Check-in realizado!", description: isOnline ? "Enviado ao servidor." : "Salvo offline — será sincronizado." });
    } catch {
      setGpsCoords({ lat: -23.5505, lng: -46.6333 });
      setCheckedIn(true);
      toast({ title: "Check-in realizado!", description: "GPS simulado (modo demo)" });
    } finally {
      setGpsLoading(false);
    }
  };

  const handleTakePhoto = async (type: "before" | "after") => {
    try {
      // Try native Capacitor camera first
      const { nativeCamera } = await import("@/services/nativeFeatures");
      const result = await nativeCamera.takePhoto();
      if (type === "before") setPhotoBefore(result.dataUrl!);
      else setPhotoAfter(result.dataUrl!);
      toast({ title: `Foto ${type === "before" ? "ANTES" : "DEPOIS"} capturada` });
    } catch {
      // Fallback: file input for web preview
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (type === "before") setPhotoBefore(dataUrl);
            else setPhotoAfter(dataUrl);
            toast({ title: `Foto ${type === "before" ? "ANTES" : "DEPOIS"} capturada` });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleStartTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "in_progress" as TaskStatus } : t));
    setSelectedTask({ ...task, status: "in_progress" });
    enqueue("task_update", { taskId: task.id, status: "in_progress" });
    toast({ title: "Tarefa iniciada", description: isOnline ? task.title : `${task.title} (salvo offline)` });
  };

  const handleFinishTask = () => {
    if (!selectedTask) return;
    if (!photoBefore || !photoAfter) {
      toast({ title: "Fotos obrigatórias", description: "Capture foto ANTES e DEPOIS.", variant: "destructive" });
      return;
    }
    setTasks((prev) => prev.map((t) => t.id === selectedTask.id ? { ...t, status: "validating" as TaskStatus } : t));
    enqueue("task_finish", {
      taskId: selectedTask.id,
      notes,
      checklist: checklistState,
      photoBefore,
      photoAfter,
    });
    toast({ title: "Tarefa enviada para validação", description: isOnline ? selectedTask.title : `${selectedTask.title} (será sincronizado)` });
    setView("list");
  };

  const toggleChecklist = (index: number) => {
    setChecklistState((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  // ─── LIST VIEW ───
  if (view === "list") {
    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Offline banner */}
        {(!isOnline || pendingCount > 0) && (
          <div className={`px-5 py-2 flex items-center justify-between text-xs font-bold ${isOnline ? "bg-accent/20 text-accent-foreground" : "bg-danger/20 text-danger"}`}>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? `${pendingCount} pendência(s) para sincronizar` : "Modo offline — dados salvos localmente"}</span>
            </div>
            {isOnline && pendingCount > 0 && (
              <button onClick={syncNow} disabled={syncing} className="flex items-center gap-1 underline">
                <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} /> Sincronizar
              </button>
            )}
          </div>
        )}
        {/* Header */}
        <div className="bg-primary px-5 pt-6 pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-[0.15em]">SIGEO Mobile</p>
                <h1 className="text-primary-foreground text-xl font-display font-bold mt-0.5">
                  Olá, {user.name.split(" ")[0]} 👋
                </h1>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">{user.avatar || "JS"}</span>
              </div>
            </div>

            {/* Check-in bar */}
            <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm border border-primary-foreground/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation className={`w-5 h-5 ${checkedIn ? "text-success" : "text-primary-foreground/50"}`} />
                  <div>
                    <p className="text-primary-foreground text-sm font-semibold">
                      {checkedIn ? "Check-in realizado" : "Registre seu ponto"}
                    </p>
                    {gpsCoords && (
                      <p className="text-primary-foreground/50 text-[10px] font-mono">
                        {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={checkedIn ? "outline" : "default"}
                  className={checkedIn
                    ? "border-success/50 text-success bg-success/10 hover:bg-success/20"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }
                  disabled={gpsLoading}
                  onClick={handleCheckIn}
                >
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : checkedIn ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  <span className="ml-1.5 text-xs font-bold">{checkedIn ? "OK" : "Check-in"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="px-5 -mt-3 relative z-10">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progresso do Dia</span>
              <span className="text-sm font-display font-bold text-foreground">{completedCount}/{todayTasks.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: todayTasks.length > 0 ? `${(completedCount / todayTasks.length) * 100}%` : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 px-5 pt-5 pb-8 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Minhas Tarefas ({todayTasks.length})
          </h2>
          {todayTasks.map((task, index) => {
            const cfg = statusConfig[task.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOpenTask(task)}
                className="bg-card rounded-xl border border-border p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{task.id}</span>
                      <span className={`status-chip text-[10px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.scheduledAt}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                </div>
                {task.priority === "Alta" && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3 h-3 text-danger" />
                    <span className="text-[10px] font-bold text-danger uppercase">Prioridade Alta</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Switch to desktop */}
          <button
            onClick={() => {
              sessionStorage.setItem("sigeo_force_desktop", "true");
              navigate("/", { replace: true });
            }}
            className="mt-6 mb-2 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors py-3"
          >
            <Monitor className="w-4 h-4" />
            Acessar versão desktop
          </button>
        </div>
      </div>
    );
  }

  // ─── DETAIL VIEW ───
  if (view === "detail" && selectedTask) {
    const cfg = statusConfig[selectedTask.status];
    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Header */}
        <div className="bg-primary px-5 pt-6 pb-5">
          <button onClick={() => setView("list")} className="flex items-center gap-1 text-primary-foreground/70 text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary-foreground/50">{selectedTask.id}</span>
            <span className={`status-chip text-[10px] ${cfg.color}`}>{cfg.label}</span>
          </div>
          <h1 className="text-primary-foreground text-lg font-display font-bold">{selectedTask.title}</h1>
        </div>

        <div className="flex-1 px-5 py-5 space-y-4">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border p-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Local</span>
              <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedTask.location}
              </p>
              <p className="text-xs text-muted-foreground">{selectedTask.area}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Horário / SLA</span>
              <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> {selectedTask.scheduledAt}
              </p>
              <p className="text-xs text-muted-foreground">SLA: {selectedTask.sla}</p>
            </div>
          </div>

          {selectedTask.description && (
            <div className="bg-card rounded-xl border border-border p-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Descrição</span>
              <p className="text-sm text-foreground mt-1">{selectedTask.description}</p>
            </div>
          )}

          {/* Checklist */}
          {selectedTask.checklist && selectedTask.checklist.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-3 block">Checklist de Execução</span>
              <div className="space-y-2">
                {selectedTask.checklist.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleChecklist(i)}
                    className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {checklistState[i] ? (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`text-sm ${checklistState[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo capture */}
          <div className="bg-card rounded-xl border border-border p-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-3 block">Evidências Fotográficas</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Antes</p>
                {photoBefore ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square border-2 border-success/30">
                    <img src={photoBefore} alt="Antes" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-success rounded-full p-0.5">
                      <Check className="w-3 h-3 text-success-foreground" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePhoto("before")}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase">Tirar Foto</span>
                  </button>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-accent uppercase mb-1.5">Depois</p>
                {photoAfter ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square border-2 border-accent/30 ring-2 ring-accent/10">
                    <img src={photoAfter} alt="Depois" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5">
                      <Check className="w-3 h-3 text-accent-foreground" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePhoto("after")}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-accent/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <Image className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase">Tirar Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl border border-border p-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Observações do Técnico</span>
            <Textarea
              placeholder="Descreva o serviço realizado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex gap-3 safe-area-bottom">
          {selectedTask.status === "pending" ? (
            <Button className="flex-1 h-12 font-bold" onClick={() => handleStartTask(selectedTask)}>
              <Zap className="w-5 h-5 mr-2" /> Iniciar Tarefa
            </Button>
          ) : selectedTask.status === "in_progress" ? (
            <Button
              className="flex-1 h-12 font-bold bg-success hover:bg-success/90 text-success-foreground"
              onClick={handleFinishTask}
            >
              <CheckCircle className="w-5 h-5 mr-2" /> Finalizar e Enviar
            </Button>
          ) : (
            <Button className="flex-1 h-12" variant="outline" onClick={() => setView("list")}>
              Voltar às Tarefas
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default TechnicianMobile;
