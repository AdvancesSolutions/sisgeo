import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Task, Priority } from "@/types/models";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (task: Partial<Task>) => void;
}

const serviceTypes = ["Limpeza", "Manutenção", "Inspeção", "Jardinagem", "Elétrica", "Hidráulica"];
const locations = ["Unidade Centro", "Unidade Sul", "Unidade Norte", "Unidade Leste"];
const employees = ["Maria Silva", "João Santos", "Carlos Oliveira", "Ana Costa", "Pedro Lima", "Roberto Alves"];

const CreateTaskDialog = ({ open, onOpenChange, onCreated }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Priority>("Média");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sla, setSla] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title || !type || !location || !assignee) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, tipo, local e responsável.", variant: "destructive" });
      return;
    }

    onCreated({
      title, type, location, area, assignee, priority,
      scheduledAt: scheduledAt || "08:00",
      sla: sla || "2h",
      description,
      status: "pending",
    });

    toast({ title: "Ordem criada", description: `${title} foi adicionada com sucesso.` });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle(""); setType(""); setLocation(""); setArea("");
    setAssignee(""); setPriority("Média"); setScheduledAt("");
    setSla(""); setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" placeholder="Ex: Limpeza geral" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Serviço *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Local *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue placeholder="Selecione unidade" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Input id="area" placeholder="Ex: Sala 102" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsável *</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Horário</Label>
              <Input id="scheduledAt" type="time" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sla">SLA</Label>
              <Input id="sla" placeholder="Ex: 2h" value={sla} onChange={(e) => setSla(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" placeholder="Detalhes do serviço..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Criar Ordem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
