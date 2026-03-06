import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusChip from "@/components/ui/StatusChip";
import { MapPin, Clock, User, FileText, CheckSquare } from "lucide-react";
import type { Task } from "@/types/models";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailModal = ({ task, open, onOpenChange }: TaskDetailModalProps) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
            <StatusChip status={task.status} />
          </div>
          <DialogTitle className="font-display text-xl mt-2">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Local</p>
                <p className="text-sm text-foreground font-medium">{task.location}</p>
                <p className="text-xs text-muted-foreground">{task.area}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Responsável</p>
                <p className="text-sm text-foreground font-medium">{task.assignee}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Horário</p>
                <p className="text-sm text-foreground font-medium">{task.scheduledAt}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">SLA</p>
              <p className="text-sm text-foreground font-medium">{task.sla}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Prioridade</p>
              <p className={`text-sm font-semibold ${task.priority === "Alta" ? "text-danger" : task.priority === "Média" ? "text-warning" : "text-muted-foreground"}`}>
                {task.priority}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tipo de Serviço</p>
              <p className="text-sm text-foreground">{task.type}</p>
            </div>
          </div>

          {task.description && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Descrição</p>
              <p className="text-sm text-foreground">{task.description}</p>
            </div>
          )}

          {task.checklist && task.checklist.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Checklist</p>
              </div>
              <div className="space-y-1.5">
                {task.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
