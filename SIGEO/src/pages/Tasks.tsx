import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusChip from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/button";
import { Plus, Download, MapPin, Clock, User, Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateTaskDialog from "@/components/dialogs/CreateTaskDialog";
import TaskDetailModal from "@/components/dialogs/TaskDetailModal";
import SmartDispatcherPanel from "@/components/dialogs/SmartDispatcherPanel";
import EmptyState from "@/components/ui/EmptyState";
import { mockTasks } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import type { Task, TaskStatus } from "@/types/models";

const statusFilterMap: Record<string, TaskStatus | "all"> = {
  "Todas": "all",
  "Pendentes": "pending",
  "Em Execução": "in_progress",
  "Em Validação": "validating",
  "Concluídas": "completed",
  "Reprovadas": "rejected",
};

const priorityStyles = {
  Alta: "text-danger font-semibold",
  Média: "text-warning font-medium",
  Baixa: "text-muted-foreground",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [statusFilter, setStatusFilter] = useState<string>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dispatcherOpen, setDispatcherOpen] = useState(false);
  const [dispatchTask, setDispatchTask] = useState<Task | null>(null);

  const locations = useMemo(() => [...new Set(tasks.map((t) => t.location))], [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "Todas" || task.status === statusFilterMap[statusFilter];
      const searchMatch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const locMatch = locationFilter === "all" || task.location === locationFilter;
      const prioMatch = priorityFilter === "all" || task.priority === priorityFilter;
      return statusMatch && searchMatch && locMatch && prioMatch;
    });
  }, [tasks, statusFilter, searchQuery, locationFilter, priorityFilter]);

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      ...taskData,
      id: `OS-${String(tasks.length + 1).padStart(3, "0")}`,
      status: "pending",
    } as Task;
    setTasks([...tasks, newTask]);
  };

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleSmartDispatch = (task: Task) => {
    setDispatchTask(task);
    setDispatcherOpen(true);
  };

  const handleAssign = (taskId: string, employeeId: string) => {
    toast({ title: "Técnico atribuído", description: `Smart Dispatcher atribuiu a ${taskId} com sucesso.` });
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredTasks.length} de {tasks.length} tarefas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10" onClick={() => {
            const pending = tasks.find((t) => t.status === "pending");
            if (pending) handleSmartDispatch(pending);
            else toast({ title: "Nenhuma tarefa pendente", description: "Todas as tarefas já têm responsável." });
          }}>
            <Zap className="w-4 h-4 mr-2" /> Sugerir Técnico
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Ordem
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, ID ou responsável..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Local" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os locais</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status chips */}
      <div className="flex items-center gap-2 mb-4">
        {Object.keys(statusFilterMap).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredTasks.length === 0 ? (
          <EmptyState
            variant="tasks"
            title="Tudo limpo por aqui!"
            description="Nenhuma tarefa encontrada com os filtros aplicados."
            actionLabel="Limpar filtros"
            onAction={() => { setStatusFilter("Todas"); setSearchQuery(""); setLocationFilter("all"); setPriorityFilter("all"); }}
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Serviço</th>
                <th>Local</th>
                <th>Responsável</th>
                <th>Horário</th>
                <th>SLA</th>
                <th>Prioridade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="cursor-pointer" onClick={() => handleRowClick(task)}>
                  <td className="font-mono text-xs text-muted-foreground">{task.id}</td>
                  <td>
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.type}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <div>
                        <p className="text-foreground text-sm">{task.location}</p>
                        <p className="text-xs">{task.area}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{task.assignee}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {task.scheduledAt}
                    </div>
                  </td>
                  <td className="text-sm">{task.sla}</td>
                  <td className={`text-xs ${priorityStyles[task.priority]}`}>{task.priority}</td>
                  <td><StatusChip status={task.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreateTask} />
      <TaskDetailModal task={selectedTask} open={detailOpen} onOpenChange={setDetailOpen} />
      <SmartDispatcherPanel open={dispatcherOpen} onOpenChange={setDispatcherOpen} task={dispatchTask} onAssign={handleAssign} />
    </AppLayout>
  );
};

export default Tasks;
