import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Material, MovementType } from "@/types/models";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  onMovement: (materialId: string, type: MovementType, quantity: number, reason: string) => void;
}

const StockMovementDialog = ({ open, onOpenChange, materials, onMovement }: StockMovementDialogProps) => {
  const [materialId, setMaterialId] = useState("");
  const [type, setType] = useState<MovementType>("Entrada");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!materialId || !quantity || Number(quantity) <= 0) {
      toast({ title: "Dados inválidos", description: "Selecione material e quantidade válida.", variant: "destructive" });
      return;
    }

    onMovement(materialId, type, Number(quantity), reason);
    toast({ title: "Movimentação registrada", description: `${type} de ${quantity} unidades registrada.` });
    setMaterialId(""); setType("Entrada"); setQuantity(""); setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-display">Movimentação de Estoque</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Material *</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger><SelectValue placeholder="Selecione material" /></SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={(v) => setType(v as MovementType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantidade *</Label>
              <Input id="qty" type="number" min="1" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo / Observação</Label>
            <Textarea id="reason" placeholder="Ex: Reposição mensal, Consumo OS-003..." value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementDialog;
