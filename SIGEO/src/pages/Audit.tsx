import AppLayout from "@/components/layout/AppLayout";
import { Shield, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const logs = [
  { time: "15:42", user: "Admin", action: "Reprovou serviço OS-005", detail: "Motivo: fotos insuficientes", type: "warning" },
  { time: "15:30", user: "Carlos Oliveira", action: "Submeteu serviço OS-003 para validação", detail: "3 fotos, GPS válido", type: "info" },
  { time: "14:55", user: "Ana Costa", action: "Check-in com GPS divergente", detail: "Distância: 450m do geofence", type: "danger" },
  { time: "14:20", user: "Admin", action: "Alterou geofence Unidade Norte", detail: "Raio: 150m → 180m", type: "info" },
  { time: "13:10", user: "Maria Silva", action: "Concluiu serviço OS-001", detail: "SLA: dentro do prazo", type: "success" },
  { time: "12:45", user: "Sistema", action: "Alerta de estoque baixo", detail: "Desinfetante 5L - Unidade Centro", type: "warning" },
  { time: "11:00", user: "Admin", action: "Criou nova ordem OS-010", detail: "Manutenção preventiva - Unidade Sul", type: "info" },
];

const typeColors: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

const Audit = () => {
  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-1">Trilha completa de ações e eventos do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[log.type]}`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{log.user}</span> · {log.action}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{log.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Audit;
