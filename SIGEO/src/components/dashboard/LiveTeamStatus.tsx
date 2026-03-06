import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockEmployees } from "@/data/mockData";

const statusMap: Record<string, { label: string; color: string }> = {
  "Ativo": { label: "Disponível", color: "bg-success" },
  "Em campo": { label: "Em Execução", color: "bg-warning" },
  "Inativo": { label: "Offline", color: "bg-muted-foreground/40" },
};

const LiveTeamStatus = () => {
  const team = mockEmployees.slice(0, 6);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h3 className="font-display font-semibold text-foreground">Status em Tempo Real</h3>
        <button className="text-primary font-semibold text-sm hover:underline">Ver mapa completo</button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Técnico</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Função</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Unidade</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((emp) => {
              const st = statusMap[emp.status] || statusMap["Inativo"];
              return (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-foreground text-sm">{emp.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${st.color}`} />
                      <span className="text-xs font-medium text-foreground">{st.label}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LiveTeamStatus;
