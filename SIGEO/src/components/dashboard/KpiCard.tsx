import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  sparklineData?: number[];
}

const KpiCard = ({ title, value, change, icon: Icon, iconColor = "bg-primary/10 text-primary", sparklineData }: KpiCardProps) => {
  const chartData = sparklineData?.map((v, i) => ({ v, i }));
  const sparkColor = change !== undefined && change >= 0 ? "hsl(152, 60%, 40%)" : change !== undefined ? "hsl(0, 72%, 51%)" : "hsl(220, 60%, 45%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="kpi-card relative overflow-hidden"
    >
      {/* Sparkline background */}
      {chartData && chartData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? "text-success" : "text-danger"}`}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(change)}% vs semana anterior</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default KpiCard;
