import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, CheckCircle2, X } from "lucide-react";
import { mockEmployees } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import type { Task } from "@/types/models";

interface SmartDispatcherPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onAssign: (taskId: string, employeeId: string) => void;
}

const scoreEmployee = (emp: typeof mockEmployees[0], task: Task | null) => {
  if (!task) return { score: 0, distance: 0, eta: 0, load: 0 };
  let score = 0;

  if (emp.unit === task.location) score += 35;
  else score += 10;

  const roleTypeMap: Record<string, string[]> = {
    Operadora: ["Limpeza"],
    Operador: ["Limpeza"],
    Técnico: ["Manutenção", "Elétrica", "Hidráulica"],
    Inspetor: ["Inspeção"],
  };
  if (roleTypeMap[emp.role]?.includes(task.type)) score += 30;
  else score += 5;

  const cap = Math.max(0, 8 - emp.tasksToday);
  score += cap * 4;
  if (emp.status === "Ativo") score += 5;
  if (emp.status === "Inativo") score -= 20;

  const finalScore = Math.min(100, Math.max(0, score));
  const distance = emp.unit === task.location
    ? +(Math.random() * 2 + 0.3).toFixed(1)
    : +(Math.random() * 8 + 3).toFixed(1);
  const eta = Math.round(distance * 4 + Math.random() * 5);

  return { score: finalScore, distance, eta, load: emp.tasksToday };
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-accent";
  return "text-muted-foreground";
};

const SmartDispatcherPanel = ({ open, onOpenChange, task, onAssign }: SmartDispatcherPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = mockEmployees
    .map((emp) => ({ ...emp, ...scoreEmployee(emp, task) }))
    .sort((a, b) => b.score - a.score);

  const handleAssign = (empId: string) => {
    if (task) {
      onAssign(task.id, empId);
      const emp = ranked.find((e) => e.id === empId);
      toast({
        title: "Técnico alocado com sucesso",
        description: `${emp?.name} foi atribuído à ${task.id} — ${task.title}`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display flex items-center gap-2 text-xl">
              <Zap className="w-5 h-5 text-accent" />
              Alocação Inteligente
            </SheetTitle>
          </SheetHeader>

          {/* Selected OS info */}
          {task && (
            <div className="bg-muted/50 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                OS Selecionada
              </span>
              <p className="font-display font-semibold text-foreground mt-1">{task.title}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {task.location}
                </span>
                <span>{task.type}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.scheduledAt}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions list */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground italic mb-2">
            Sugestões baseadas em proximidade e skills:
          </p>

          {ranked.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedId(emp.id)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedId === emp.id
                  ? "border-accent ring-2 ring-accent/20 shadow-md"
                  : "border-border hover:shadow-md hover:border-accent/30"
              }`}
            >
              {/* Name + Score */}
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
                  <span className="block font-display font-bold text-2xl">{emp.score}%</span>
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
                  <span className="text-sm font-medium">{emp.eta} min</span>
                </div>
              </div>

              {/* Load bar + Assign button */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold">Carga de hoje</span>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${
                          i < Math.ceil(emp.load / 2) ? "bg-accent" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssign(emp.id);
                  }}
                  className="gap-1.5"
                >
                  <Zap size={14} className="text-accent fill-accent" />
                  Alocar Agora
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SmartDispatcherPanel;
