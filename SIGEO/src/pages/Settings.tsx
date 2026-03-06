import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Settings, Users, MapPin, Wrench, Bell, Shield, Database } from "lucide-react";

const sections = [
  { icon: Users, title: "Gestão de Acessos", desc: "Convites, perfis RBAC, skills matrix e logs de auditoria por gestor", path: "/settings/team" },
  { icon: MapPin, title: "Geofencing", desc: "Configurar raio de tolerância, validação GPS e regras de check-in/check-out" },
  { icon: Wrench, title: "Tipos de Serviço", desc: "Cadastrar tipos, checklists parametrizáveis, tempos padrão (SLA)" },
  { icon: Bell, title: "Notificações", desc: "Configurar alertas push, email e WhatsApp por tipo de evento", path: "/settings/notifications" },
  { icon: Shield, title: "Antifraude", desc: "Regras de hash de foto, validação de câmera ao vivo, bloqueios por GPS" },
  { icon: Database, title: "Integrações", desc: "Conectar com sistemas de ponto, ERP, folha de pagamento" },
];

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Parâmetros gerais do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div
            key={s.title}
            onClick={() => s.path && navigate(s.path)}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
