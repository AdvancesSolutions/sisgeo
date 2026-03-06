import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Phone, Shield, Search } from "lucide-react";
import CreateEmployeeDialog from "@/components/dialogs/CreateEmployeeDialog";
import EmployeeDetailModal from "@/components/dialogs/EmployeeDetailModal";
import { mockEmployees } from "@/data/mockData";
import type { Employee } from "@/types/models";

const statusColors: Record<string, string> = {
  "Ativo": "bg-success/10 text-success",
  "Em campo": "bg-primary/10 text-primary",
  "Inativo": "bg-muted text-muted-foreground",
};

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const units = useMemo(() => [...new Set(employees.map((e) => e.unit))], [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const searchMatch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase());
      const unitMatch = unitFilter === "all" || e.unit === unitFilter;
      const statusMatch = statusFilter === "all" || e.status === statusFilter;
      return searchMatch && unitMatch && statusMatch;
    });
  }, [employees, searchQuery, unitFilter, statusFilter]);

  const handleCreate = (data: Partial<Employee>) => {
    const newEmp: Employee = {
      ...data,
      id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
    } as Employee;
    setEmployees([...employees, newEmp]);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Funcionários</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {employees.length} funcionários</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas unidades</SelectItem>
            {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Em campo">Em campo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-sm">Nenhum funcionário encontrado.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(""); setUnitFilter("all"); setStatusFilter("all"); }}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelectedEmployee(emp); setDetailOpen(true); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-sm">{emp.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{emp.name}</h3>
                    <span className={`status-chip ${statusColors[emp.status]}`}>{emp.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{emp.role}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{emp.unit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarefas hoje</span>
                  <span className="font-medium text-foreground">{emp.completedToday}/{emp.tasksToday}</span>
                </div>
                {emp.tasksToday > 0 && (
                  <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(emp.completedToday / emp.tasksToday) * 100}%` }} />
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {emp.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreate} />
      <EmployeeDetailModal employee={selectedEmployee} open={detailOpen} onOpenChange={setDetailOpen} />
    </AppLayout>
  );
};

export default Employees;
