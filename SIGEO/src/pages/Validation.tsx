import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusChip from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle, XCircle, MapPin, Clock, User, Camera, AlertTriangle,
  Eye, MessageSquare, CheckSquare, Square, Check, X, Calendar, ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockValidations } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import type { ValidationItem } from "@/types/models";
import { motion, AnimatePresence } from "framer-motion";

type ValidationStatus = "validating" | "completed" | "rejected";

// Audit checklist items per validation
const auditChecks = [
  { label: "Check-in via GPS validado", key: "gps" },
  { label: "Uso de EPIs visível nas fotos", key: "epi" },
  { label: "Materiais utilizados batem com estoque", key: "materials" },
  { label: "Fotos possuem timestamp válido", key: "timestamp" },
];

const Validation = () => {
  const [validations, setValidations] = useState<(ValidationItem & { validationStatus: ValidationStatus })[]>(
    mockValidations.map((v) => ({ ...v, validationStatus: "validating" as ValidationStatus }))
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalSrc, setPhotoModalSrc] = useState("");
  const [photoModalLabel, setPhotoModalLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pendingItems = validations.filter((v) => v.validationStatus === "validating");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map((p) => p.id)));
    }
  };

  const handleBulkApprove = () => {
    setValidations((prev) => prev.map((v) => selectedIds.has(v.id) ? { ...v, validationStatus: "completed" as ValidationStatus } : v));
    toast({ title: "Aprovação em massa", description: `${selectedIds.size} serviço(s) aprovado(s).` });
    setSelectedIds(new Set());
  };

  const handleApprove = (id: string) => {
    setValidations((prev) => prev.map((v) => v.id === id ? { ...v, validationStatus: "completed" as ValidationStatus } : v));
    toast({ title: "Serviço aprovado", description: `${id} foi aprovado com sucesso.` });
    setExpandedId(null);
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast({ title: "Informe o motivo", description: "É necessário justificar a reprovação.", variant: "destructive" });
      return;
    }
    setValidations((prev) => prev.map((v) => v.id === rejectingId ? { ...v, validationStatus: "rejected" as ValidationStatus } : v));
    toast({ title: "Serviço reprovado", description: `${rejectingId} foi reprovado.`, variant: "destructive" });
    setRejectDialogOpen(false);
    setExpandedId(null);
  };

  const openPhoto = (src: string, label: string) => {
    setPhotoModalSrc(src);
    setPhotoModalLabel(label);
    setPhotoModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel de Validação</h1>
          <p className="text-sm text-muted-foreground mt-1">{pendingItems.length} serviços aguardando aprovação</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selecionado(s)</span>
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={handleBulkApprove}>
              <CheckCircle className="w-4 h-4 mr-1.5" /> Aprovar Selecionados
            </Button>
          </div>
        )}
      </div>

      {/* Select all */}
      {pendingItems.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {selectedIds.size === pendingItems.length ? (
              <CheckSquare className="w-4 h-4 text-accent" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Selecionar todos
          </button>
        </div>
      )}

      {pendingItems.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-xl border border-border">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground">Tudo em dia!</p>
          <p className="text-sm text-muted-foreground mt-1">Não há serviços pendentes de validação.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Compact Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}>
                      {selectedIds.has(item.id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <StatusChip status="validating" />
                    {!item.gpsValid && (
                      <span className="flex items-center gap-1 text-xs text-danger font-medium">
                        <AlertTriangle className="w-3 h-3" /> GPS divergente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {item.assignee}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.submittedAt}</span>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="text-success hover:text-success hover:bg-success/10 h-8 px-3" onClick={() => handleApprove(item.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10 h-8 px-3" onClick={() => handleRejectClick(item.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Action Bar */}
                      <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-b border-border">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Finalizado: {item.submittedAt}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-danger text-danger hover:bg-danger/10"
                            onClick={() => handleRejectClick(item.id)}
                          >
                            <X className="w-4 h-4 mr-1.5" /> Reprovar
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground shadow-md"
                            onClick={() => handleApprove(item.id)}
                          >
                            <Check className="w-4 h-4 mr-1.5" /> Aprovar Serviço
                          </Button>
                        </div>
                      </div>

                      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Col 1-2: Visual Evidence */}
                        <div className="lg:col-span-2 space-y-5">
                          {/* Before vs After */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Camera className="w-4 h-4 text-muted-foreground" />
                              <h4 className="text-sm font-semibold text-foreground">Evidências Visuais (Antes vs. Depois)</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Antes da Execução</span>
                                <div
                                  className="relative rounded-xl overflow-hidden aspect-video bg-muted border-2 border-border cursor-pointer group"
                                  onClick={() => openPhoto(item.photoBefore, `${item.id} - Antes`)}
                                >
                                  <img src={item.photoBefore} alt="Antes" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-success uppercase tracking-widest text-right block">Após a Execução</span>
                                <div
                                  className="relative rounded-xl overflow-hidden aspect-video bg-muted border-2 border-success/30 ring-4 ring-success/10 cursor-pointer group"
                                  onClick={() => openPhoto(item.photoAfter, `${item.id} - Depois`)}
                                >
                                  <img src={item.photoAfter} alt="Depois" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tech report */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Relatório do Técnico</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl italic border border-border">
                              "{item.notes || "Sem observações adicionais."}"
                            </p>
                          </div>

                          {/* Materials */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Materiais Utilizados</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.materials.map((mat, i) => (
                                <span key={i} className="px-3 py-1.5 bg-muted/40 rounded-lg text-sm text-foreground border border-border">
                                  {mat.name} <span className="text-muted-foreground">×{mat.qty}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Col 3: Audit Sidebar */}
                        <div className="space-y-5">
                          {/* Audit Checklist */}
                          <div className="bg-card p-5 rounded-xl border border-border">
                            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-accent" /> Checklist de Auditoria
                            </h4>
                            <div className="space-y-3">
                              {auditChecks.map((audit, i) => {
                                // Derive status from data
                                const passed = audit.key === "gps" ? item.gpsValid :
                                  audit.key === "materials" ? item.checklistDone.every(Boolean) :
                                  true; // default to passed for demo
                                return (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <span className="text-sm font-medium text-foreground">{audit.label}</span>
                                    {passed ? (
                                      <Check className="w-4 h-4 text-success" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-warning" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Execution Checklist */}
                          <div className="bg-card p-5 rounded-xl border border-border">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Checklist de Execução</h4>
                            <div className="space-y-2">
                              {item.checklist.map((check, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className={`w-4 h-4 shrink-0 ${item.checklistDone[i] ? "text-success" : "text-muted-foreground"}`} />
                                  <span className={item.checklistDone[i] ? "text-foreground" : "text-muted-foreground line-through"}>{check}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Geofencing Card */}
                          <div className="bg-primary p-5 rounded-xl text-primary-foreground">
                            <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-accent" /> Geofencing
                            </h4>
                            <div className="w-full h-24 bg-primary-foreground/10 rounded-lg mb-3 flex items-center justify-center border border-primary-foreground/20">
                              <span className="text-[10px] text-primary-foreground/50 text-center px-4">
                                Mapa de calor do local da tarefa vs. posição do técnico
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span>Desvio de Local:</span>
                              <span className={item.gpsValid ? "text-success" : "text-danger"}>
                                {item.gpsValid ? "0.02km (Válido)" : "1.5km (Inválido)"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-danger" />
              Reprovar Serviço {rejectingId}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">Informe o motivo da reprovação. O funcionário receberá esta justificativa.</p>
            <Textarea
              placeholder="Ex: Fotos insuficientes, checklist incompleto, qualidade inadequada..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>Confirmar Reprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo zoom modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-sm font-medium">{photoModalLabel}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <img src={photoModalSrc} alt={photoModalLabel} className="w-full rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Validation;
