import { LucideIcon, ClipboardList, Package, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "tasks" | "materials" | "employees" | "search" | "default";
}

const variantIcons: Record<string, LucideIcon> = {
  tasks: ClipboardList,
  materials: Package,
  employees: Users,
  search: Search,
  default: ClipboardList,
};

const EmptyState = ({ icon, title, description, actionLabel, onAction, variant = "default" }: EmptyStateProps) => {
  const Icon = icon || variantIcons[variant];

  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-foreground text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
