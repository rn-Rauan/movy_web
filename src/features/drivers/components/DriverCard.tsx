import { Pencil, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Driver } from "@/lib/types";

type Props = {
  driver: Driver;
  onEdit: (d: Driver) => void;
  onRemove: (d: Driver) => void;
};

export function DriverCard({ driver: d, onEdit, onRemove }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {d.userName ?? d.userEmail ?? "Motorista"}
          </div>
          {d.userEmail && d.userName && (
            <div className="text-xs text-muted-foreground truncate">{d.userEmail}</div>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span>CNH {d.cnh}</span>
            <span>·</span>
            <span>Cat. {d.cnhCategory}</span>
            <span>·</span>
            <span>Val. {new Date(d.cnhExpiresAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={d.driverStatus === "ACTIVE" ? "default" : "outline"} className="text-xs">
            {d.driverStatus === "ACTIVE"
              ? "Ativo"
              : d.driverStatus === "SUSPENDED"
                ? "Suspenso"
                : "Inativo"}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(d)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onRemove(d)}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
