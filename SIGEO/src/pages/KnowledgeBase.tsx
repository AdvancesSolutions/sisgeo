import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Video, Wrench, Zap, ShieldCheck, BookOpen } from "lucide-react";
import { useState } from "react";

const articles = [
  { id: 1, title: "Como trocar filtro de ar-condicionado Split", category: "Manutenção", type: "pdf", readTime: "5 min", views: 142 },
  { id: 2, title: "Procedimento de limpeza hospitalar - Nível 3", category: "Limpeza", type: "pdf", readTime: "8 min", views: 89 },
  { id: 3, title: "Inspeção de extintores - Checklist completo", category: "Inspeção", type: "pdf", readTime: "3 min", views: 234 },
  { id: 4, title: "Reparo elétrico básico - Disjuntores", category: "Elétrica", type: "video", readTime: "12 min", views: 67 },
  { id: 5, title: "Uso correto de EPIs em áreas úmidas", category: "Segurança", type: "video", readTime: "6 min", views: 198 },
  { id: 6, title: "Manutenção preventiva de portas automáticas", category: "Manutenção", type: "pdf", readTime: "10 min", views: 45 },
  { id: 7, title: "Protocolo de descarte de resíduos químicos", category: "Segurança", type: "pdf", readTime: "7 min", views: 112 },
  { id: 8, title: "Calibração de sensores de presença", category: "Elétrica", type: "video", readTime: "15 min", views: 34 },
];

const categoryIcons: Record<string, typeof Wrench> = {
  "Manutenção": Wrench,
  "Limpeza": ShieldCheck,
  "Inspeção": Search,
  "Elétrica": Zap,
  "Segurança": ShieldCheck,
};

const KnowledgeBase = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [...new Set(articles.map((a) => a.category))];

  const filtered = articles.filter((a) => {
    const searchMatch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const catMatch = category === "all" || a.category === category;
    return searchMatch && catMatch;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Base de Conhecimento</h1>
          <p className="text-sm text-muted-foreground mt-1">Manuais, tutoriais e procedimentos operacionais</p>
        </div>
        <Button size="sm"><BookOpen className="w-4 h-4 mr-2" /> Novo Artigo</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar procedimentos, manuais..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((article) => {
          const CatIcon = categoryIcons[article.category] || FileText;
          return (
            <div key={article.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${article.type === "video" ? "bg-danger/10" : "bg-primary/10"}`}>
                  {article.type === "video" ? (
                    <Video className="w-5 h-5 text-danger" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {article.type === "video" ? "Vídeo" : "PDF"}
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{article.title}</h3>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CatIcon className="w-3 h-3" /> {article.category}</span>
                <span>·</span>
                <span>{article.readTime}</span>
                <span>·</span>
                <span>{article.views} views</span>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default KnowledgeBase;
