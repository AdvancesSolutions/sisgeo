import { Wifi, WifiOff, Cloud, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SyncStatus = "online" | "syncing" | "offline" | "pending";

interface OfflineSyncIndicatorProps {
  pendingEvents?: number;
  compact?: boolean;
}

const statusConfig: Record<SyncStatus, { icon: typeof Wifi; label: string; className: string; bg: string }> = {
  online: { icon: Cloud, label: "Sincronizado", className: "text-success", bg: "bg-success/10" },
  syncing: { icon: RefreshCw, label: "Sincronizando...", className: "text-accent", bg: "bg-accent/10" },
  offline: { icon: WifiOff, label: "Offline", className: "text-danger", bg: "bg-danger/10" },
  pending: { icon: Wifi, label: "Pendente", className: "text-warning", bg: "bg-warning/10" },
};

const OfflineSyncIndicator = ({ pendingEvents = 0, compact = false }: OfflineSyncIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(navigator.onLine ? "online" : "offline");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingEvents > 0) {
        setSyncStatus("syncing");
        setTimeout(() => setSyncStatus("online"), 2000);
      } else {
        setSyncStatus("online");
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pendingEvents]);

  useEffect(() => {
    if (isOnline && pendingEvents > 0) {
      setSyncStatus("pending");
    } else if (isOnline && pendingEvents === 0) {
      setSyncStatus("online");
    }
  }, [pendingEvents, isOnline]);

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg}`} title={config.label}>
        <Icon className={`w-3.5 h-3.5 ${config.className} ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
        {pendingEvents > 0 && (
          <span className={`text-[10px] font-bold ${config.className}`}>{pendingEvents}</span>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} transition-colors`}
      >
        <Icon className={`w-4 h-4 ${config.className} ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
        <span className={`text-xs font-medium ${config.className}`}>{config.label}</span>
        {pendingEvents > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/20 ${config.className}`}>
            {pendingEvents} evento{pendingEvents > 1 ? "s" : ""}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineSyncIndicator;
