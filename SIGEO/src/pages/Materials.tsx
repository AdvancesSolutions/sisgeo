import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, AlertTriangle, Package, ArrowDown, ArrowUp, Search, ArrowRightLeft,
  ArrowDownRight, RefreshCw, ShoppingCart,
} from "lucide-react";
import StockMovementDialog from "@/components/dialogs/StockMovementDialog";
import { mockMaterials, mockTasks } from "@/data/mockData";
import type { Material, MovementType } from "@/types/models";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Recent write-offs linked to OS
const recentWriteOffs = [
  { osId: "OS-001", items: ["1x Desinfetante 5L", "3x Pano multiuso"], time: "Há 2h", assignee: "Maria Silva" },
  { osId: "OS-002", items: ["1x Lubrificante WD-40"], time: "Há 4h", assignee: "João Santos" },
  { osId: "OS-003", items: ["2x Lacre de segurança"], time: "Há 5h", assignee: "Carlos Oliveira" },
];

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [movementOpen, setMovementOpen] = useState(false);

  const categories = useMemo(() => [...new Set(materials.map((m) => m.category))], [materials]);
  const units = useMemo(() => [...new Set(materials.map((m) => m.unit))], [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const searchMatch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = categoryFilter === "all" || m.category === categoryFilter;
      const unitMatch = unitFilter === "all" || m.unit === unitFilter;
      const stockMatch = stockFilter === "all" || (stockFilter === "low" && m.stock < m.min) || (stockFilter === "ok" && m.stock >= m.min);
      return searchMatch && catMatch && unitMatch && stockMatch;
    });
  }, [materials, searchQuery, categoryFilter, unitFilter, stockFilter]);

  const lowStock = materials.filter((m) => m.stock < m.min);

  const handleMovement = (materialId: string, type: MovementType, quantity: number, reason: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === materialId) {
          const newStock = type === "Entrada" ? m.stock + quantity : Math.max(0, m.stock - quantity);
          return { ...m, stock: newStock, lastMovement: type, lastDate: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) };
        }
        return m;
      })
    );
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Controle de Materiais</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {materials.length} materiais</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Sincronizando...", description: "Dados de estoque atualizados." })}>
            <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMovementOpen(true)}>
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Movimentar
          </Button>
          <Button size="sm" onClick={() => toast({ title: "Em breve", description: "Cadastro de material será implementado com o backend." })}>
            <Plus className="w-4 h-4 mr-2" /> Entrada de Nota
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar material..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Estoque" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low">Abaixo do mínimo</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main table — col 1-2 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Inventory table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-display font-semibold text-foreground">
                Estoque por Unidade: <span className="text-accent font-normal">{unitFilter === "all" ? "Todas" : unitFilter}</span>
              </h3>
            </div>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-sm">Nenhum material encontrado.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setUnitFilter("all"); setStockFilter("all"); }}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Saldo Atual</th>
                    <th>Mínimo</th>
                    <th>Consumo/Sem.</th>
                    <th>Última Mov.</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div>
                          <span className="font-semibold text-foreground">{m.name}</span>
                          <span className="block text-xs text-muted-foreground">{m.category} · {m.unit}</span>
                        </div>
                      </td>
                      <td className={`font-display font-bold text-lg ${m.stock < m.min ? "text-danger" : "text-foreground"}`}>
                        {m.stock}
                      </td>
                      <td className="text-sm text-muted-foreground">{m.min}</td>
                      <td className="text-sm">{m.consumption}</td>
                      <td>
                        <span className="flex items-center gap-1.5 text-xs">
                          {m.lastMovement === "Entrada" ? <ArrowDown className="w-3 h-3 text-success" /> : <ArrowUp className="w-3 h-3 text-danger" />}
                          <span className="text-muted-foreground">{m.lastMovement} · {m.lastDate}</span>
                        </span>
                      </td>
                      <td>
                        {m.stock < m.min ? (
                          <span className="status-chip bg-danger/15 text-danger flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Reposição
                          </span>
                        ) : (
                          <span className="status-chip bg-success/15 text-success">Em Dia</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-primary hover:text-primary underline h-auto py-1 px-2"
                          onClick={() => setMovementOpen(true)}
                        >
                          Ajustar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar — col 3 */}
        <div className="space-y-5">
          {/* Recent Write-offs */}
          <div className="bg-card p-5 rounded-xl border border-border">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-danger" /> Baixas Recentes
            </h3>
            <div className="space-y-3">
              {recentWriteOffs.map((wo) => (
                <div key={wo.osId} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-primary uppercase">{wo.osId}</span>
                    <span className="text-[10px] font-bold text-muted-foreground italic">{wo.time}</span>
                  </div>
                  {wo.items.map((item, i) => (
                    <p key={i} className="text-xs font-medium text-foreground">{item}</p>
                  ))}
                  <p className="text-[10px] text-muted-foreground mt-1">Técnico: {wo.assignee}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground text-xs font-bold hover:border-primary/30 hover:text-primary transition-all">
              Ver Histórico Completo
            </button>
          </div>

          {/* Critical Stock Alert */}
          {lowStock.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warning p-5 rounded-xl text-warning-foreground shadow-lg relative overflow-hidden"
            >
              <Package className="absolute -right-3 -bottom-3 w-20 h-20 opacity-20 rotate-12" />
              <div className="relative z-10">
                <h4 className="font-display font-bold text-lg mb-1 italic">Atenção!</h4>
                <p className="text-sm font-medium opacity-90 leading-tight mb-4">
                  Você tem {lowStock.length} {lowStock.length === 1 ? "item" : "itens"} abaixo do estoque mínimo.
                  Isso pode travar as ordens de serviço de amanhã.
                </p>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] uppercase tracking-wider"
                  onClick={() => toast({ title: "Pedido de compra", description: `Lista gerada com ${lowStock.length} itens para reposição.` })}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                  Gerar Pedido de Compra
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <StockMovementDialog open={movementOpen} onOpenChange={setMovementOpen} materials={materials} onMovement={handleMovement} />
    </AppLayout>
  );
};

export default Materials;
