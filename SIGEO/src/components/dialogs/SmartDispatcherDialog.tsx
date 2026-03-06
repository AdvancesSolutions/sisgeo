import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, CheckCircle2, User } from "lucide-react";
import { mockEmployees } from "@/data/mockData";
import type { Task } from "@/types/models";

interface SmartDispatcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onAssign: (taskId: string, employeeId: string) => void;
}

// Simulated AI scoring with richer data
const scoreEmployee = (emp: typeof mockEmployees[0], task: Task | null) => {
  if (!task) return { score: 0, distance: 0, eta: 0, load: 0 };
  let score = 0;

  if (emp.unit === task.location) score += 35;
  else score += 10;

  const roleTypeMap: Record<string, string[]> = {
    "Operadora": ["Limpeza"],
    "Operador": ["Limpeza"],
    "Técnico": ["Manutenção", "Elétrica", "Hidráulica"],
    "Inspetor": ["Inspeção"],
  };
  if (roleTypeMap[emp.role]?.includes(task.type)) score += 30;
  else score += 5;

  const availableCapacity = Math.max(0, 8 - emp.tasksToday);
  score += availableCapacity * 4;

  if (emp.status === "Ativo") score += 5;
  if (emp.status === "Inativo") score -= 20;

  const finalScore = Math.min(100, Math.max(0, score));
  const distance = emp.unit === task.location ? +(Math.random() * 2 + 0.3).toFixed(1) : +(Math.random() * 8 + 3).toFixed(1);
  const eta = Math.round(distance * 4 + Math.random() * 5);

  return { score: finalScore, distance, eta, load: emp.tasksToday };
};

const SmartDispatcherDialog = ({ open, onOpenChange, task, onAssign }: SmartDispatcherDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rankedEmployees = mockEmployees
    .map((emp) => ({ ...emp, ...scoreEmployee(emp, task) }))
    .sort((a, b) => b.score - a.score);

  const handleAssign = () => {
    if (selectedId && task) {
      onAssign(task.id, selectedId);
      onOpenChange(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Smart Dispatcher — Sugestão de Técnico
          </DialogTitle>
        </DialogHeader>

        {task && (
          <div className="bg-muted/50 rounded-lg p-3 mb-2 text-sm">
            <p className="font-medium text-foreground">{task.title}</p>
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.location}</span>
              <span>{task.type}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.scheduledAt}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {rankedEmployees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedId(emp.id)}
              className={`w-full text-left bg-card border rounded-xl p-4 transition-all duration-200 ${
                selectedId === emp.id
                  ? "border-accent ring-2 ring-accent/20 shadow-md"
                  : "border-border hover:shadow-md hover:border-accent/30"
              }`}
            >
              {/* Header: Name + Score */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-display font-bold text-foreground text-lg tracking-tight">
                    {emp.name}
                  </h4>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> {emp.role}
                  </span>
                </div>
                <div className={`text-right ${getScoreColor(emp.score)}`}>
                  <span className="block font-display font-bold text-2xl">
                    {emp.score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Match Score</span>
                </div>
              </div>

              {/* Distance + ETA */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 p-2 rounded-lg">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm font-medium">{emp.distance} km</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 p-2 rounded-lg">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium">{emp.eta} min para chegar</span>
                </div>
              </div>

              {/* Load bar + Assign CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold">Carga de hoje</span>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${i < Math.ceil(emp.load / 2) ? "bg-accent" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>

                {selectedId === emp.id && (
                  <span className="text-xs font-semibold text-accent flex items-center gap-1">
                    <Zap size={14} className="fill-accent" /> Selecionado
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!selectedId} className="gap-2">
            <Zap className="w-4 h-4 text-accent fill-accent" /> Alocar Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SmartDispatcherDialog;
