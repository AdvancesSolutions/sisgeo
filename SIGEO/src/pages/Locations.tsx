import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building2, AlertTriangle, Shield, Activity, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const locations = [
  {
    name: "Unidade Centro", address: "Rua Augusta, 1200 - São Paulo", areas: 12, activeEmployees: 8, geofenceRadius: 200,
    healthScore: 92, repairCount30d: 2, lat: -23.5505, lng: -46.6333,
    recentIssues: ["Ar-condicionado Sala 205 (2x)", "Porta automática recepção"]
  },
  {
    name: "Unidade Sul", address: "Av. Paulista, 900 - São Paulo", areas: 8, activeEmployees: 5, geofenceRadius: 150,
    healthScore: 67, repairCount30d: 7, lat: -23.5614, lng: -46.6560,
    recentIssues: ["Elevador B (3x)", "Vazamento banheiro 2° andar (2x)", "Iluminação corredor C", "Porta sala 301"]
  },
  {
    name: "Unidade Norte", address: "Rua Voluntários, 450 - Santana", areas: 6, activeEmployees: 4, geofenceRadius: 180,
    healthScore: 85, repairCount30d: 3, lat: -23.4980, lng: -46.6270,
    recentIssues: ["Infiltração teto", "Sensor de presença", "Piso danificado"]
  },
  {
    name: "Unidade Leste", address: "Av. Aricanduva, 2300 - São Paulo", areas: 10, activeEmployees: 3, geofenceRadius: 250,
    healthScore: 45, repairCount30d: 11, lat: -23.5580, lng: -46.5160,
    recentIssues: ["Sistema elétrico (4x)", "Ar-condicionado central (3x)", "Portão garagem (2x)", "Hidráulica (2x)"]
  },
];

const getHealthColor = (score: number) => {
  if (score >= 80) return { text: "text-success", bg: "bg-success", ring: "ring-success/20" };
  if (score >= 60) return { text: "text-warning", bg: "bg-warning", ring: "ring-warning/20" };
  return { text: "text-danger", bg: "bg-danger", ring: "ring-danger/20" };
};

const Locations = () => {
  const [selectedLoc, setSelectedLoc] = useState<typeof locations[0] | null>(null);
  const [geofenceOpen, setGeofenceOpen] = useState(false);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Locais & Áreas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie unidades, áreas, geofences e saúde dos ativos</p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Nova Unidade</Button>
      </div>

      {/* Alert for low health */}
      {locations.filter((l) => l.healthScore < 60).length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Activity className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">Atenção: Unidades com saúde crítica</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {locations.filter((l) => l.healthScore < 60).map((l) => `${l.name} (${l.healthScore}%)`).join(", ")} — recomenda-se inspeção profunda.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => {
          const health = getHealthColor(loc.healthScore);
          return (
            <div key={loc.name} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelectedLoc(loc); setGeofenceOpen(true); }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{loc.name}</h3>
                    {/* Health Score */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-2 ${health.ring}`}>
                      <Activity className={`w-3.5 h-3.5 ${health.text}`} />
                      <span className={`text-xs font-bold ${health.text}`}>{loc.healthScore}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {loc.address}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{loc.areas}</p>
                  <p className="text-xs text-muted-foreground">Áreas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{loc.activeEmployees}</p>
                  <p className="text-xs text-muted-foreground">Func.</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{loc.geofenceRadius}m</p>
                  <p className="text-xs text-muted-foreground">Geofence</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${loc.repairCount30d > 5 ? "text-danger" : "text-foreground"}`}>{loc.repairCount30d}</p>
                  <p className="text-xs text-muted-foreground">Reparos/30d</p>
                </div>
              </div>

              {/* Recent issues preview */}
              {loc.repairCount30d > 5 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-danger font-medium mb-1.5">
                    <AlertTriangle className="w-3 h-3" /> Manutenções recorrentes detectadas
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {loc.recentIssues.slice(0, 3).map((issue, i) => (
                      <span key={i} className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full">{issue}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Geofence + Detail modal */}
      <Dialog open={geofenceOpen} onOpenChange={setGeofenceOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              {selectedLoc?.name} — Geofence & Saúde
            </DialogTitle>
          </DialogHeader>
          {selectedLoc && (
            <div className="space-y-5 py-2">
              {/* Geofence visualization */}
              <div className="relative bg-muted/50 rounded-xl p-6 flex items-center justify-center">
                <div className="relative">
                  {/* Outer ring - geofence radius */}
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-accent bg-card px-2 py-0.5 rounded-full border border-accent/30">
                      {selectedLoc.geofenceRadius}m
                    </span>
                    {/* Inner valid zone */}
                    <div className="w-24 h-24 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-success/30 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-success" />
                      </div>
                    </div>
                    {/* Labels */}
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">
                      Zona válida para check-in
                    </span>
                  </div>
                </div>
              </div>

              {/* Health details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">Saúde do Ativo</span>
                  <span className={`text-sm font-bold ${getHealthColor(selectedLoc.healthScore).text}`}>{selectedLoc.healthScore}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getHealthColor(selectedLoc.healthScore).bg}`}
                    style={{ width: `${selectedLoc.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Recent issues */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Manutenções Recentes (30 dias)</h4>
                <div className="space-y-1.5">
                  {selectedLoc.recentIssues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-foreground">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Coordenadas</p>
                  <p className="font-mono text-foreground">{selectedLoc.lat}, {selectedLoc.lng}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Endereço</p>
                  <p className="text-foreground">{selectedLoc.address}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Locations;
