import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, MapPin, Clock, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { mockTimeClockRecords } from "@/data/mockData";
import type { TimeClockRecord, TimeClockStatus } from "@/types/models";

const statusIcons: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  ok: { icon: CheckCircle, color: "text-success", label: "Regular" },
  late: { icon: Clock, color: "text-warning", label: "Atraso" },
  gps_issue: { icon: AlertTriangle, color: "text-danger", label: "GPS divergente" },
  absent: { icon: XCircle, color: "text-muted-foreground", label: "Ausente" },
};

const TimeClock = () => {
  const [records] = useState<TimeClockRecord[]>(mockTimeClockRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const units = useMemo(() => [...new Set(records.map((r) => r.unit))], [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const searchMatch = !searchQuery || r.employee.toLowerCase().includes(searchQuery.toLowerCase());
      const unitMatch = unitFilter === "all" || r.unit === unitFilter;
      const statusMatch = statusFilter === "all" || r.status === statusFilter;
      return searchMatch && unitMatch && statusMatch;
    });
  }, [records, searchQuery, unitFilter, statusFilter]);

  const summary = useMemo(() => ({
    present: records.filter((r) => r.status === "ok").length,
    late: records.filter((r) => r.status === "late").length,
    gps: records.filter((r) => r.status === "gps_issue").length,
    absent: records.filter((r) => r.status === "absent").length,
  }), [records]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Controle de Ponto</h1>
          <p className="text-sm text-muted-foreground mt-1">Registros de check-in/check-out com geolocalização</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Presentes", value: summary.present, color: "text-success" },
          { label: "Atrasados", value: summary.late, color: "text-warning" },
          { label: "Problemas GPS", value: summary.gps, color: "text-danger" },
          { label: "Ausentes", value: summary.absent, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="kpi-card text-center">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar funcionário..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">Regular</SelectItem>
            <SelectItem value="late">Atraso</SelectItem>
            <SelectItem value="gps_issue">GPS divergente</SelectItem>
            <SelectItem value="absent">Ausente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Unidade</th>
                <th>Check-in</th>
                <th>GPS In</th>
                <th>Check-out</th>
                <th>GPS Out</th>
                <th>Horas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const st = statusIcons[r.status];
                return (
                  <tr key={r.id}>
                    <td className="font-medium text-foreground">{r.employee}</td>
                    <td><span className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {r.unit}</span></td>
                    <td className="font-mono text-sm">{r.checkIn}</td>
                    <td>{r.gpsIn ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}</td>
                    <td className="font-mono text-sm">{r.checkOut}</td>
                    <td>
                      {r.checkOut !== "-" ? (
                        r.gpsOut ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-sm font-medium">{r.hours}</td>
                    <td><span className={`flex items-center gap-1.5 text-xs font-medium ${st.color}`}><st.icon className="w-3.5 h-3.5" /> {st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};

export default TimeClock;
