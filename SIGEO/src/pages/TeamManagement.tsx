import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StatusChip from "@/components/ui/StatusChip";
import {
  Users,
  Mail,
  Plus,
  Shield,
  Search,
  Clock,
  Tag,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  AppRole,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  SKILL_OPTIONS,
  type UserProfile,
} from "@/types/roles";

// Mock team members
const mockTeam: UserProfile[] = [
  { id: "USR-001", email: "admin@sigeo.com.br", name: "Admin SIGEO", role: "super_admin", avatar: "AS", createdAt: "2024-01-15" },
  { id: "USR-002", email: "carlos@sigeo.com.br", name: "Carlos Mendes", role: "manager", unit: "Unidade Centro", avatar: "CM", skills: ["Limpeza", "Manutenção Geral"], createdAt: "2024-02-10" },
  { id: "USR-003", email: "lucia@sigeo.com.br", name: "Lúcia Fernandes", role: "manager", unit: "Unidade Sul", avatar: "LF", skills: ["Inspeção", "Segurança"], createdAt: "2024-03-05" },
  { id: "USR-004", email: "maria@sigeo.com.br", name: "Maria Silva", role: "technician", unit: "Unidade Centro", avatar: "MS", skills: ["Limpeza"], phone: "(11) 99999-1234", createdAt: "2024-04-01" },
  { id: "USR-005", email: "joao@sigeo.com.br", name: "João Santos", role: "technician", unit: "Unidade Centro", avatar: "JS", skills: ["Elétrica", "HVAC / Ar-Condicionado"], phone: "(11) 99999-5678", createdAt: "2024-04-01" },
  { id: "USR-006", email: "pedro@sigeo.com.br", name: "Pedro Lima", role: "technician", unit: "Unidade Leste", avatar: "PL", skills: ["Hidráulica", "Manutenção Geral"], phone: "(11) 99999-7890", createdAt: "2024-05-15" },
];

// Mock audit logs
const mockAuditLogs = [
  { id: "LOG-001", user: "Carlos Mendes", action: "Alterou status da OS-002 para 'Em Execução'", timestamp: "03/03 09:42", type: "task" },
  { id: "LOG-002", user: "Lúcia Fernandes", action: "Aprovou validação da OS-003", timestamp: "03/03 10:55", type: "validation" },
  { id: "LOG-003", user: "Admin SIGEO", action: "Adicionou novo técnico Pedro Lima", timestamp: "02/03 14:20", type: "team" },
  { id: "LOG-004", user: "Carlos Mendes", action: "Ajustou ponto manual de Maria Silva", timestamp: "02/03 16:30", type: "timeclock" },
  { id: "LOG-005", user: "Admin SIGEO", action: "Alterou permissões do perfil Gestor", timestamp: "01/03 11:00", type: "settings" },
];

const roleColors: Record<AppRole, string> = {
  super_admin: "bg-danger/15 text-danger",
  manager: "bg-accent/15 text-accent",
  technician: "bg-primary/15 text-primary",
};

const TeamManagement = () => {
  const [team, setTeam] = useState(mockTeam);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"team" | "skills" | "audit">("team");

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("manager");
  const [inviteUnit, setInviteUnit] = useState("");

  const filtered = team.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast({
      title: "Convite enviado",
      description: `Um convite foi enviado para ${inviteEmail} como ${ROLE_LABELS[inviteRole]}.`,
    });
    setInviteOpen(false);
    setInviteEmail("");
  };

  const tabs = [
    { key: "team" as const, label: "Equipe", icon: Users },
    { key: "skills" as const, label: "Skills Matrix", icon: Tag },
    { key: "audit" as const, label: "Logs de Auditoria", icon: Clock },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Acessos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convites, permissões e auditoria da equipe
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Mail className="w-4 h-4 mr-2" /> Convidar Membro
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Team */}
      {activeTab === "team" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="manager">Gestor</SelectItem>
                <SelectItem value="technician">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membro</th>
                  <th>Perfil</th>
                  <th>Unidade</th>
                  <th>Skills</th>
                  <th>Desde</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-display font-bold text-primary text-xs">{m.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[m.role]}`}>
                        <Shield className="w-3 h-3" />
                        {ROLE_LABELS[m.role]}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground">{m.unit || "Global"}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {m.skills?.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                        {(m.skills?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{(m.skills?.length || 0) - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">{m.createdAt}</td>
                    <td>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Skills Matrix */}
      {activeTab === "skills" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Técnico</th>
                {SKILL_OPTIONS.map((s) => (
                  <th key={s} className="text-center !text-[10px]">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team
                .filter((m) => m.role === "technician")
                .map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium text-foreground">{m.name}</td>
                    {SKILL_OPTIONS.map((skill) => (
                      <td key={skill} className="text-center">
                        {m.skills?.includes(skill) ? (
                          <span className="inline-block w-4 h-4 rounded-full bg-success/20 text-success text-xs leading-4">✓</span>
                        ) : (
                          <span className="inline-block w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs leading-4">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {mockAuditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                  <td className="font-medium text-foreground text-sm">{log.user}</td>
                  <td className="text-sm text-muted-foreground">{log.action}</td>
                  <td>
                    <Badge variant="outline" className="text-[10px] capitalize">{log.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display">Convidar Membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
              <Input
                type="email"
                placeholder="nome@empresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Perfil</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Gestor de Unidade</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteRole !== "super_admin" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Unidade</label>
                <Select value={inviteUnit} onValueChange={setInviteUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unidade Centro">Unidade Centro</SelectItem>
                    <SelectItem value="Unidade Sul">Unidade Sul</SelectItem>
                    <SelectItem value="Unidade Norte">Unidade Norte</SelectItem>
                    <SelectItem value="Unidade Leste">Unidade Leste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Permissões do perfil:</p>
              <div className="flex flex-wrap gap-1">
                {ROLE_PERMISSIONS[inviteRole].map((p) => (
                  <Badge key={p} variant="secondary" className="text-[10px]">
                    {p.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              <Mail className="w-4 h-4 mr-1.5" /> Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TeamManagement;
