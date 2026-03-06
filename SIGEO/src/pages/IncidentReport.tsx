import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertOctagon, Camera, MapPin, Send, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const IncidentReport = () => {
  const [submitted, setSubmitted] = useState(false);
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!severity || !description || !location) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Ocorrência registrada!", description: "Gestores foram notificados imediatamente." });
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Ocorrência Registrada</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Sua ocorrência foi enviada com sucesso. Os gestores e supervisores foram notificados imediatamente via push e email.
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => { setSubmitted(false); setSeverity(""); setDescription(""); setLocation(""); }}>
              Nova Ocorrência
            </Button>
            <Button onClick={() => window.history.back()}>Voltar ao Sistema</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h1 className="page-title">Reportar Ocorrência</h1>
            <p className="text-sm text-muted-foreground">Reporte acidentes, emergências ou problemas graves</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 text-sm text-foreground flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <span>Em caso de emergência com risco de vida, ligue <strong>192 (SAMU)</strong> ou <strong>193 (Bombeiros)</strong> imediatamente.</span>
          </div>

          <div className="space-y-2">
            <Label>Gravidade *</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger><SelectValue placeholder="Selecione a gravidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">🔴 Crítica — Risco à vida ou patrimônio</SelectItem>
                <SelectItem value="high">🟠 Alta — Requer ação imediata</SelectItem>
                <SelectItem value="medium">🟡 Média — Precisa atenção em breve</SelectItem>
                <SelectItem value="low">🟢 Baixa — Registrar para acompanhamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Local *</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue placeholder="Onde ocorreu?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Unidade Centro">Unidade Centro</SelectItem>
                <SelectItem value="Unidade Sul">Unidade Sul</SelectItem>
                <SelectItem value="Unidade Norte">Unidade Norte</SelectItem>
                <SelectItem value="Unidade Leste">Unidade Leste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incDesc">Descrição detalhada *</Label>
            <Textarea
              id="incDesc"
              placeholder="Descreva o que aconteceu, quando, onde e se há feridos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Foto (opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Clique para tirar foto ou fazer upload</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Sua localização GPS será capturada automaticamente ao enviar.</span>
          </div>

          <Button className="w-full bg-danger hover:bg-danger/90 text-danger-foreground" size="lg" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" /> Enviar Ocorrência
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default IncidentReport;
