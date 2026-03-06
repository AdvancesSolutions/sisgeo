import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, Download, Filter,
  BarChart3, Users, Package, CheckCircle, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const weeklyData = [
  { name: "Seg", concluidas: 40, retrabalho: 4 },
  { name: "Ter", concluidas: 35, retrabalho: 2 },
  { name: "Qua", concluidas: 52, retrabalho: 8 },
  { name: "Qui", concluidas: 48, retrabalho: 3 },
  { name: "Sex", concluidas: 61, retrabalho: 1 },
];

const costByCategory = [
  { name: "Limpeza", value: 3200 },
  { name: "Manutenção", value: 5800 },
  { name: "Inspeção", value: 1200 },
  { name: "Emergência", value: 2100 },
];

const monthlyTrend = [
  { month: "Out", os: 180, sla: 88 },
  { month: "Nov", os: 210, sla: 91 },
  { month: "Dez", os: 195, sla: 85 },
  { month: "Jan", os: 230, sla: 90 },
  { month: "Fev", os: 245, sla: 93 },
  { month: "Mar", os: 260, sla: 92 },
];

const topTechnicians = [
  { name: "Maria Silva", completed: 48, rating: 97 },
  { name: "João Santos", completed: 42, rating: 94 },
  { name: "Carlos Oliveira", completed: 38, rating: 91 },
  { name: "Ana Costa", completed: 35, rating: 89 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--danger))",
  "hsl(var(--success))",
];

const Reports = () => {
  const [period, setPeriod] = useState("week");

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inteligência Operacional</h1>
          <p className="text-sm text-muted-foreground mt-1">Análise de performance e custos da rede</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] h-9">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: "Exportando...", description: "Relatório PDF gerado com sucesso." })}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "OS Concluídas", value: "236", change: 12, icon: CheckCircle, color: "text-success" },
          { label: "Tempo Médio (min)", value: "42", change: -8, icon: Clock, color: "text-primary" },
          { label: "Taxa Retrabalho", value: "3.2%", change: -15, icon: AlertTriangle, color: "text-warning" },
          { label: "Custo Material", value: "R$ 12.3k", change: 5, icon: Package, color: "text-accent" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.change >= 0 ? "text-success" : "text-danger"}`}>
                {kpi.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Main chart: Productivity vs Rework */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-display font-semibold text-foreground">Produtividade vs. Retrabalho</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-primary" /> Concluídas
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-danger" /> Retrabalho
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", background: "hsl(var(--card))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="concluidas" name="Concluídas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="retrabalho" name="Retrabalho" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA + Insight */}
        <div className="space-y-5">
          <div className="bg-card p-5 rounded-xl border border-border">
            <h3 className="font-display font-semibold text-foreground mb-5">SLA de Atendimento</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">Tempo Médio Resposta</span>
                  <span className="text-sm font-bold text-foreground">42 min</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">Conclusão no Prazo</span>
                  <span className="text-sm font-bold text-foreground">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">Satisfação Cliente</span>
                  <span className="text-sm font-bold text-foreground">4.6/5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-success p-5 rounded-xl text-success-foreground shadow-lg relative overflow-hidden">
            <TrendingUp className="absolute -right-3 -bottom-3 w-24 h-24 opacity-10 rotate-12" />
            <div className="relative z-10">
              <h4 className="font-display font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Insight de Eficiência
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                A Unidade Sul reduziu o retrabalho em <strong>12%</strong> após a implementação da Validação por Fotos.
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 w-full text-xs font-bold"
              >
                Ver Detalhes do Estudo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Trend + Costs + Top techs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly trend */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-5">Tendência Mensal (OS × SLA %)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="os" name="Total OS" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="sla" name="SLA %" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost breakdown + Top technicians */}
        <div className="space-y-5">
          {/* Pie chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Custo por Categoria</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {costByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
              {costByCategory.map((c, i) => (
                <span key={c.name} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Top technicians */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Top Técnicos
            </h3>
            <div className="space-y-3">
              {topTechnicians.map((tech, i) => (
                <div key={tech.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tech.completed} OS · {tech.rating}% aprovação</p>
                  </div>
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${tech.rating}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
