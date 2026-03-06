import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const SmartNudge = () => {
  return (
    <div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="font-display font-bold text-lg mb-2 italic text-accent">Dica do SIGEO</h4>
        <p className="text-sm opacity-80 leading-relaxed">
          Você tem 3 tarefas na Unidade Sul que combinam com as habilidades de <strong>João Silva</strong>. Deseja otimizar a rota?
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 font-bold"
        >
          Otimizar Agora
        </Button>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-4 -translate-y-4">
        <TrendingUp className="w-28 h-28" />
      </div>
    </div>
  );
};

export default SmartNudge;
