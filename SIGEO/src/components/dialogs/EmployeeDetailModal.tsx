import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Shield, BarChart3 } from "lucide-react";
import type { Employee } from "@/types/models";

interface EmployeeDetailModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  "Ativo": "bg-success/10 text-success",
  "Em campo": "bg-primary/10 text-primary",
  "Inativo": "bg-muted text-muted-foreground",
};

const EmployeeDetailModal = ({ employee, open, onOpenChange }: EmployeeDetailModalProps) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="font-display font-bold text-primary">{employee.avatar}</span>
            </div>
            <div>
              <p className="text-lg">{employee.name}</p>
              <span className={`status-chip text-xs mt-1 ${statusColors[employee.status] || ""}`}>{employee.status}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Função</p>
                <p className="font-medium text-foreground">{employee.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Unidade</p>
                <p className="font-medium text-foreground">{employee.unit}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{employee.phone}</span>
            </div>
            {employee.cpf && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">CPF: {employee.cpf}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Performance Hoje</p>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tarefas concluídas</span>
              <span className="font-semibold text-foreground">{employee.completedToday}/{employee.tasksToday}</span>
            </div>
            {employee.tasksToday > 0 && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${(employee.completedToday / employee.tasksToday) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailModal;
