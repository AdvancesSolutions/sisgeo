import { useState, useRef, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TaskStatus } from "@/types/models";

interface StatusChipProps {
  status: TaskStatus;
  label?: string;
  actionable?: boolean;
  onStatusChange?: (newStatus: TaskStatus) => void;
}

const statusConfig: Record<TaskStatus, { className: string; defaultLabel: string }> = {
  pending: { className: "status-pending", defaultLabel: "Pendente" },
  in_progress: { className: "status-in-progress", defaultLabel: "Em Execução" },
  validating: { className: "status-validating", defaultLabel: "Em Validação" },
  completed: { className: "status-completed", defaultLabel: "Concluída" },
  rejected: { className: "status-rejected", defaultLabel: "Reprovada" },
};

const allStatuses: TaskStatus[] = ["pending", "in_progress", "validating", "completed", "rejected"];

const StatusChip = ({ status, label, actionable = false, onStatusChange }: StatusChipProps) => {
  const config = statusConfig[status];

  const chip = (
    <span className={`${config.className} ${actionable ? "cursor-pointer hover:ring-2 hover:ring-ring/20 transition-all" : ""}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label || config.defaultLabel}
    </span>
  );

  if (!actionable || !onStatusChange) return chip;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {chip}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {allStatuses.filter((s) => s !== status).map((s) => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(s)} className="gap-2">
            <span className={`w-2 h-2 rounded-full ${statusConfig[s].className.includes("pending") ? "bg-warning" : statusConfig[s].className.includes("progress") ? "bg-primary" : statusConfig[s].className.includes("validating") ? "bg-accent" : statusConfig[s].className.includes("completed") ? "bg-success" : "bg-danger"}`} />
            {statusConfig[s].defaultLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusChip;
