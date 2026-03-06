import { CheckCircle, XCircle, Clock, Camera, MapPin } from "lucide-react";

const activities = [
  { icon: CheckCircle, color: "text-success", text: "Maria Silva concluiu limpeza - Bloco A, Sala 102", time: "há 5 min" },
  { icon: Camera, color: "text-primary", text: "João Santos enviou fotos para validação - Manutenção #347", time: "há 12 min" },
  { icon: XCircle, color: "text-danger", text: "Serviço #341 reprovado - fotos insuficientes", time: "há 25 min" },
  { icon: MapPin, color: "text-warning", text: "Carlos Oliveira fez check-in - Unidade Centro", time: "há 30 min" },
  { icon: Clock, color: "text-muted-foreground", text: "Ana Costa registrou ponto com atraso de 15 min", time: "há 45 min" },
  { icon: CheckCircle, color: "text-success", text: "Inspeção mensal aprovada - Unidade Sul", time: "há 1h" },
];

const RecentActivity = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Atividade Recente</h3>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <activity.icon className={`w-4 h-4 mt-0.5 shrink-0 ${activity.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{activity.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
