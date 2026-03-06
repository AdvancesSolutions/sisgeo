import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Camera, Save, ShieldCheck, MapPin } from "lucide-react";
import { SKILL_OPTIONS, ROLE_LABELS, type AppRole } from "@/types/roles";
import type { Employee, EmployeeStatus } from "@/types/models";
import { motion } from "framer-motion";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (employee: Partial<Employee>) => void;
}

const units = ["Unidade Centro", "Unidade Sul", "Unidade Norte", "Unidade Leste"];

const CreateEmployeeDialog = ({ open, onOpenChange, onCreated }: CreateEmployeeDialogProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [permission, setPermission] = useState<AppRole>("technician");
  const [skills, setSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = () => {
    if (!name || !unit || !email) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, unidade e email.", variant: "destructive" });
      return;
    }

    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    onCreated({
      name,
      role: ROLE_LABELS[permission],
      unit,
      phone,
      email,
      cpf,
      status: "Ativo" as EmployeeStatus,
      tasksToday: 0,
      completedToday: 0,
      avatar: initials,
    });

    toast({ title: "Colaborador cadastrado", description: `${name} foi adicionado com sucesso.` });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(""); setRole(""); setUnit(""); setPhone(""); setEmail(""); setCpf("");
    setPermission("technician"); setSkills([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="font-display text-2xl">Novo Colaborador</DialogTitle>
          <p className="text-sm text-muted-foreground">Preencha os dados para cadastrar um novo membro da equipe.</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 pb-8">
          {/* Column 1: Photo & Permissions */}
          <div className="lg:col-span-1 space-y-5">
            {/* Photo Upload */}
            <div className="bg-muted/30 p-6 rounded-2xl border border-border flex flex-col items-center">
              <div className="relative w-28 h-28 mb-4">
                <div className="w-full h-full rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {name ? (
                    <span className="font-display font-bold text-primary text-2xl">
                      {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-accent hover:bg-accent/80 p-2 rounded-full text-accent-foreground shadow-md transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center uppercase font-bold tracking-widest leading-tight">
                Foto de Perfil<br />(Visualização no App)
              </p>
            </div>

            {/* Permissions */}
            <div className="bg-card p-5 rounded-2xl border border-border">
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-accent" /> Permissões
              </h3>
              <Select value={permission} onValueChange={(v) => setPermission(v as AppRole)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Técnico de Campo</SelectItem>
                  <SelectItem value="manager">Gestor de Unidade</SelectItem>
                  <SelectItem value="super_admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-2">
                Define o nível de acesso ao sistema.
              </p>
            </div>
          </div>

          {/* Column 2: Personal Info & Skills */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal Info */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="font-display font-bold text-foreground mb-5 pb-3 border-b border-border">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Nome Completo *
                  </Label>
                  <Input
                    placeholder="Ex: Alessandro Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    E-mail Corporativo *
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Unidade / Polo *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="pl-9 bg-muted/30">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    CPF / Identificação
                  </Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Telefone
                  </Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </div>

            {/* Skills Matrix */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="font-display font-bold text-foreground mb-1 pb-3 border-b border-border">
                Matriz de Habilidades
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Essas tags alimentam o algoritmo de despacho inteligente (Match Score).
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <motion.button
                    key={skill}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                      skills.includes(skill)
                        ? "bg-accent/15 border-accent text-accent-foreground"
                        : "bg-muted/30 border-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
              {skills.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {skills.length} habilidade{skills.length > 1 ? "s" : ""} selecionada{skills.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" /> Salvar Cadastro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
