import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Concluídas", value: 45, color: "hsl(152, 60%, 40%)" },
  { name: "Em Execução", value: 18, color: "hsl(220, 60%, 45%)" },
  { name: "Pendentes", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Reprovadas", value: 5, color: "hsl(0, 72%, 51%)" },
];

const TaskDistributionChart = () => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Distribuição de Tarefas</h3>
      <div className="flex items-center gap-6">
        <div className="w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.value}</span>
                <span className="text-muted-foreground text-xs">({Math.round((item.value / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDistributionChart;
