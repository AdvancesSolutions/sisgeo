import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Bell, BellOff, Smartphone, Mail, MessageSquare, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  type NotificationPrefs,
  DEFAULT_PREFS,
  getNotificationPrefs,
  saveNotificationPrefs,
} from "@/services/notificationPrefs";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(getNotificationPrefs());
  }, []);

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    toast({ title: "Preferência salva", description: "Configuração de notificação atualizada." });
  };

  const resetToDefaults = () => {
    setPrefs(DEFAULT_PREFS);
    saveNotificationPrefs(DEFAULT_PREFS);
    toast({ title: "Preferências restauradas", description: "Todas as configurações voltaram ao padrão." });
  };

  const pushItems: { key: keyof NotificationPrefs; label: string; desc: string; icon: typeof Bell }[] = [
    { key: "task_assigned", label: "Tarefa atribuída", desc: "Quando uma nova tarefa é designada a você", icon: Bell },
    { key: "task_approved", label: "Tarefa aprovada", desc: "Quando o gestor aprova seu serviço", icon: Bell },
    { key: "task_rejected", label: "Tarefa rejeitada", desc: "Quando o gestor rejeita e solicita correção", icon: Bell },
    { key: "sla_warning", label: "Alerta de SLA", desc: "Quando uma tarefa está próxima do prazo limite", icon: Bell },
    { key: "stock_low", label: "Estoque baixo", desc: "Quando um material atinge o nível mínimo", icon: Bell },
    { key: "checkin_reminder", label: "Lembrete de check-in", desc: "Lembrete diário para registrar ponto", icon: Bell },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="page-title">Notificações</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure quais alertas você deseja receber</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restaurar padrão
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar configurações padrão?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as preferências de notificação serão redefinidas para os valores originais. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={resetToDefaults}>Restaurar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Push master toggle */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notificações Push</h3>
                <p className="text-sm text-muted-foreground">Alertas no celular e navegador</p>
              </div>
            </div>
            <Switch
              checked={prefs.push_enabled}
              onCheckedChange={(v) => updatePref("push_enabled", v)}
            />
          </div>
        </div>

        {/* Push notification types */}
        {prefs.push_enabled && (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {pushItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={prefs[item.key] as boolean}
                  onCheckedChange={(v) => updatePref(item.key, v)}
                />
              </div>
            ))}
          </div>
        )}

        {!prefs.push_enabled && (
          <div className="bg-muted/50 rounded-xl border border-border p-8 text-center">
            <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Notificações push desativadas</p>
            <p className="text-xs text-muted-foreground mt-1">Ative para receber alertas em tempo real</p>
          </div>
        )}

        {/* Email section */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">E-mail</h3>
                <p className="text-sm text-muted-foreground">Resumos e alertas por e-mail</p>
              </div>
            </div>
            <Switch
              checked={prefs.email_enabled}
              onCheckedChange={(v) => updatePref("email_enabled", v)}
            />
          </div>

          {prefs.email_enabled && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Resumo diário</p>
                <p className="text-xs text-muted-foreground">Receber um e-mail com o resumo das atividades do dia</p>
              </div>
              <Switch
                checked={prefs.email_daily_digest}
                onCheckedChange={(v) => updatePref("email_daily_digest", v)}
              />
            </div>
          )}
        </div>

        {/* WhatsApp placeholder */}
        <div className="bg-card rounded-xl border border-border p-5 opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">Em breve — alertas via WhatsApp Business API</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationSettings;
