import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/roles";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      <div className="ml-[260px] transition-all duration-300">
        <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar tarefas, funcionários, locais..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}{user.unit ? ` · ${user.unit}` : ""}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                {user.avatar ? (
                  <span className="text-xs font-bold text-primary-foreground">{user.avatar}</span>
                ) : (
                  <User className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
