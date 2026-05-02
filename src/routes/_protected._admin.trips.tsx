import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { tripsService } from "@/services/trips.service";
import { templatesService } from "@/services/templates.service";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripStatus, TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/trips")({
  component: AdminTripsPage,
});

const FILTERS: { label: string; value: TripStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Rascunho", value: "DRAFT" },
  { label: "Agendada", value: "SCHEDULED" },
  { label: "Confirmada", value: "CONFIRMED" },
  { label: "Cancelada", value: "CANCELED" },
  { label: "Finalizada", value: "FINISHED" },
];

const tripSchema = z.object({
  tripTemplateId: z.string().min(1, "Selecione um template"),
  departureDate: z.string().min(1, "Informe a data de partida"),
  departureTime: z.string().min(1, "Informe a hora de partida"),
  arrivalDate: z.string().min(1, "Informe a data de chegada"),
  arrivalTime: z.string().min(1, "Informe a hora estimada de chegada"),
  totalCapacity: z.coerce.number().int().min(1, "Capacidade deve ser ao menos 1"),
  initialStatus: z.enum(["DRAFT", "SCHEDULED"]),
});

type TripFormState = {
  tripTemplateId: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  totalCapacity: string;
  initialStatus: "DRAFT" | "SCHEDULED";
};

const EMPTY_TRIP_FORM: TripFormState = {
  tripTemplateId: "",
  departureDate: "",
  departureTime: "",
  arrivalDate: "",
  arrivalTime: "",
  totalCapacity: "",
  initialStatus: "DRAFT",
};

function AdminTripsPage() {
  const location = useLocation();
  // When navigating to a child route (e.g. /trips/$tripId), render the Outlet
  if (location.pathname !== "/trips") {
    return <Outlet />;
  }

  return <TripsList />;
}

function TripsList() {
  const { adminOrgId } = useRole();
  const { trips, loading, refetch } = useTrips({ orgId: adminOrgId ?? "" });
  const [filter, setFilter] = useState<TripStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<TripFormState>(EMPTY_TRIP_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TripTemplate[]>([]);

  useEffect(() => {
    if (!adminOrgId) return;
    templatesService.listByOrgId(adminOrgId).then((res) => {
      setTemplates(Array.isArray(res) ? res : (res.data ?? []));
    });
  }, [adminOrgId]);

  const list = (trips ?? []).filter((t) => {
    if (filter !== "ALL" && t.tripStatus !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (t.departurePoint ?? "").toLowerCase().includes(q) ||
        (t.destination ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openCreate() {
    setForm(EMPTY_TRIP_FORM);
    setFieldErrors({});
    setSheetOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = tripSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errs[e.path.join(".")] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { departureDate, departureTime, arrivalDate, arrivalTime, ...rest } = parsed.data;
      await tripsService.create(adminOrgId!, {
        ...rest,
        departureTime: new Date(`${departureDate}T${departureTime}`).toISOString(),
        arrivalEstimate: new Date(`${arrivalDate}T${arrivalTime}`).toISOString(),
      });
      toast.success("Viagem criada");
      setSheetOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar viagem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Viagens">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{list.length} viagens</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Criar viagem
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por origem ou destino"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingList count={4} height="h-20" />
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma viagem encontrada.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <Link
              key={t.id}
              to="/trips/$tripId"
              params={{ tripId: t.id }}
              className="block"
            >
              <Card className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm font-semibold">
                    {formatDateTime(t.departureTime)}
                  </div>
                  <Badge variant={statusVariant(t.tripStatus)}>
                    {statusLabel(t.tripStatus)}
                  </Badge>
                </div>
                {(t.departurePoint || t.destination) && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {t.departurePoint ?? "—"} → {t.destination ?? "—"}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t.totalCapacity} lugares · {t.bookedCount ?? 0} inscritos</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Trip Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Nova viagem</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            <div className="space-y-1">
              <Label>Template de rota</Label>
              <Select
                value={form.tripTemplateId}
                onValueChange={(v) => setForm((f) => ({ ...f, tripTemplateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.departurePoint} → {tpl.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.tripTemplateId && (
                <p className="text-xs text-destructive">{fieldErrors.tripTemplateId}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Data de partida</Label>
              <Input
                type="date"
                value={form.departureDate}
                onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
                className="w-full"
              />
              {fieldErrors.departureDate && (
                <p className="text-xs text-destructive">{fieldErrors.departureDate}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Hora de partida</Label>
              <Input
                type="time"
                value={form.departureTime}
                onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
                className="w-full"
              />
              {fieldErrors.departureTime && (
                <p className="text-xs text-destructive">{fieldErrors.departureTime}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Data estimada de chegada</Label>
              <Input
                type="date"
                value={form.arrivalDate}
                onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))}
                className="w-full"
              />
              {fieldErrors.arrivalDate && (
                <p className="text-xs text-destructive">{fieldErrors.arrivalDate}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Hora estimada de chegada</Label>
              <Input
                type="time"
                value={form.arrivalTime}
                onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))}
                className="w-full"
              />
              {fieldErrors.arrivalTime && (
                <p className="text-xs text-destructive">{fieldErrors.arrivalTime}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Capacidade total</Label>
              <Input
                type="number"
                min="1"
                value={form.totalCapacity}
                onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
                placeholder="Ex: 40"
              />
              {fieldErrors.totalCapacity && (
                <p className="text-xs text-destructive">{fieldErrors.totalCapacity}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Status inicial</Label>
              <Select
                value={form.initialStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, initialStatus: v as "DRAFT" | "SCHEDULED" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="SCHEDULED">Agendada (requer motorista e veículo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : "Criar viagem"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
