import { useState } from "react";
import StatusChip from "@/components/ui/StatusChip";
import { ClipboardList, MapPin, Clock, CheckCircle, Phone, Building2 } from "lucide-react";
import type { TaskStatus } from "@/types/models";

const clientOrders = [
  { id: "OS-001", title: "Limpeza geral", location: "Sala 102", status: "completed" as TaskStatus, date: "03/03/2026", time: "08:00 - 10:00", assignee: "Maria S." },
  { id: "OS-002", title: "Manutenção ar-condicionado", location: "Sala 205", status: "in_progress" as TaskStatus, date: "03/03/2026", time: "09:30 - 13:30", assignee: "João S." },
  { id: "OS-004", title: "Limpeza banheiros", location: "Banheiro 3° andar", status: "pending" as TaskStatus, date: "03/03/2026", time: "11:00 - 12:30", assignee: "Ana C." },
  { id: "OS-006", title: "Jardinagem", location: "Área externa", status: "pending" as TaskStatus, date: "03/03/2026", time: "14:00 - 18:00", assignee: "Roberto A." },
];

const CustomerPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple top bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-foreground">SIGEO</span>
            <span className="text-xs text-muted-foreground ml-2">Portal do Cliente</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>Suporte: (11) 3000-0000</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Suas Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe o status dos serviços solicitados para Unidade Centro</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: 4, color: "text-foreground" },
            { label: "Pendentes", value: 2, color: "text-warning" },
            { label: "Em Andamento", value: 1, color: "text-primary" },
            { label: "Concluídas", value: 1, color: "text-success" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {clientOrders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{order.title}</h3>
                      <StatusChip status={order.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
              </div>
              {order.status === "completed" && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Serviço concluído e validado pelo supervisor</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
