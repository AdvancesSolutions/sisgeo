import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { day: "Seg", concluidas: 12, pendentes: 3, reprovadas: 1 },
  { day: "Ter", concluidas: 15, pendentes: 2, reprovadas: 2 },
  { day: "Qua", concluidas: 10, pendentes: 5, reprovadas: 0 },
  { day: "Qui", concluidas: 18, pendentes: 1, reprovadas: 1 },
  { day: "Sex", concluidas: 14, pendentes: 4, reprovadas: 3 },
  { day: "Sáb", concluidas: 8, pendentes: 2, reprovadas: 0 },
  { day: "Dom", concluidas: 3, pendentes: 0, reprovadas: 0 },
];

const WeeklyChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Produtividade Semanal</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="concluidas" name="Concluídas" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendentes" name="Pendentes" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reprovadas" name="Reprovadas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;
