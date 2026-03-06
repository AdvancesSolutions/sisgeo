import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TaskDistributionChart from "@/components/dashboard/TaskDistributionChart";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import LiveTeamStatus from "@/components/dashboard/LiveTeamStatus";
import SmartNudge from "@/components/dashboard/SmartNudge";
import { ClipboardList, Users, Clock, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile && !sessionStorage.getItem("sigeo_force_desktop")) {
      navigate("/mobile", { replace: true });
    }
  }, [isMobile, navigate]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance da Unidade</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de equipe · Unidade Central (São Paulo) · Hoje, 3 de março de 2026</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard title="Técnicos Ativos" value="14/18" change={2} icon={Users} iconColor="bg-primary/10 text-primary" sparklineData={[12, 13, 14, 13, 15, 14, 14]} />
        <KpiCard title="Aguardando Valid." value={7} icon={Clock} iconColor="bg-warning/10 text-warning" sparklineData={[5, 8, 6, 9, 7, 10, 7]} />
        <KpiCard title="OS Fora do SLA" value={3} icon={AlertTriangle} iconColor="bg-danger/10 text-danger" sparklineData={[1, 2, 4, 3, 5, 2, 3]} />
        <KpiCard title="Concluídas Hoje" value={22} change={8} icon={CheckCircle} iconColor="bg-success/10 text-success" sparklineData={[15, 18, 20, 16, 19, 21, 22]} />
        <KpiCard title="Tarefas Hoje" value={80} change={12} icon={ClipboardList} sparklineData={[62, 68, 55, 72, 78, 74, 80]} />
        <KpiCard title="Mat. Baixos" value={4} icon={Package} iconColor="bg-warning/10 text-warning" sparklineData={[2, 3, 1, 3, 5, 3, 4]} />
      </div>

      {/* Main content: Team Status + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <LiveTeamStatus />
        </div>
        <div className="space-y-4">
          <SmartNudge />
          <RecentActivity />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <TaskDistributionChart />
      </div>

      {/* SLA */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">SLA por Unidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { unit: "Unidade Centro", sla: 94, tasks: 28 },
            { unit: "Unidade Sul", sla: 87, tasks: 22 },
            { unit: "Unidade Norte", sla: 91, tasks: 18 },
            { unit: "Unidade Leste", sla: 78, tasks: 12 },
          ].map((item) => (
            <div key={item.unit}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{item.unit}</span>
                <span className={`text-sm font-semibold ${item.sla >= 90 ? "text-success" : item.sla >= 80 ? "text-warning" : "text-danger"}`}>
                  {item.sla}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.sla >= 90 ? "bg-success" : item.sla >= 80 ? "bg-warning" : "bg-danger"}`}
                  style={{ width: `${item.sla}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.tasks} tarefas</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
