/**
 * Painel do Administrador — Torre de Controle do SIGEO
 * Super Admin: gestão de unidades, parâmetros de sistema, gestores, auditoria e licenciamento.
 */
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Shield, Database, BellRing, Save } from "lucide-react";

const DEFAULT_GEOFENCE_M = 200;
const DEFAULT_SESSION_H = 12;

const UNIDADES_ATIVAS = ["Sede Central (SP)", "Polo Sul (RS)", "Logística Nordeste (PE)"];

const AdminSettings = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-foreground tracking-tight">
              Painel do Administrador
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configurações globais do ecossistema SIGEO
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={() => navigate("/audit")}
          >
            <Save className="w-4 h-4 mr-2" />
            Aplicar Alterações Globais
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Coluna 1: Regras de Negócio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parâmetros de Segurança */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Parâmetros de Segurança
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">
                    Raio de Geofencing (metros)
                  </Label>
                  <Input
                    type="number"
                    defaultValue={DEFAULT_GEOFENCE_M}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">
                    Tempo de Sessão (horas)
                  </Label>
                  <Input
                    type="number"
                    defaultValue={DEFAULT_SESSION_H}
                    className="bg-muted/50 border-border"
                  />
                </div>
              </div>
            </div>

            {/* Backups e AWS RDS */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Backups e AWS RDS
              </h3>
              <div className="p-4 bg-muted/30 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Conexão ativa com AWS us-east-1
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase">
                  Gerar Backup Agora
                </Button>
              </div>
            </div>
          </div>

          {/* Coluna 2: Notificações e Unidades */}
          <div className="space-y-6">
            {/* Alertas de Admin */}
            <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <BellRing className="w-20 h-20 absolute -right-2 -bottom-2 opacity-10 rotate-12" />
              <h4 className="font-display font-bold text-lg mb-4 italic">Alertas de Admin</h4>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2">
                  <span className="text-sm opacity-90">Novos Gestores</span>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2">
                  <span className="text-sm opacity-90">Falhas de Backup</span>
                  <div className="w-10 h-5 bg-red-500 rounded-full relative">
                    <div className="absolute left-1 top-1 h-3 w-3 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Unidades Ativas */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Unidades Ativas
              </h3>
              <div className="space-y-2">
                {UNIDADES_ATIVAS.map((u) => (
                  <div
                    key={u}
                    className="p-3 bg-muted/30 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-foreground">{u}</span>
                    <button
                      type="button"
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      EDITAR
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="w-full mt-2 py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground text-[10px] font-bold hover:border-primary/30 hover:text-foreground transition-all uppercase"
                >
                  + Adicionar Unidade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links rápidos: Auditoria e Gestão de Gestores */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => navigate("/audit")}>
            <Shield className="w-4 h-4 mr-2" />
            Log Global de Auditoria
          </Button>
          <Button variant="outline" onClick={() => navigate("/settings/team")}>
            <Settings className="w-4 h-4 mr-2" />
            Gerenciamento de Gestores
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
