import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { api, tokenStorage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { AppShell } from "@/components/layout/AppShell";
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
import type { Organization, Paginated, TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/setup")({
  component: SetupPage,
});

type Shift = "MORNING" | "AFTERNOON" | "EVENING";
type InitialStatus = "DRAFT" | "SCHEDULED";

const step1Schema = z.object({
  organizationName: z.string().trim().min(2, "Informe o nome da organização"),
  cnpj: z.string().trim().min(14, "CNPJ deve ter ao menos 14 caracteres"),
  organizationEmail: z.string().email("E-mail inválido"),
  organizationTelephone: z.string().trim().min(8, "Telefone inválido"),
  address: z.string().trim().min(5, "Informe o endereço"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
});

const step2Schema = z.object({
  departurePoint: z.string().trim().min(2, "Informe o ponto de partida"),
  destination: z.string().trim().min(2, "Informe o destino"),
  stops: z
    .array(z.string().trim().min(1, "Parada não pode ser vazia"))
    .min(2, "Informe ao menos 2 paradas"),
  shift: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  priceOneWay: z.coerce.number().positive("Preço inválido").optional(),
  priceRoundTrip: z.coerce.number().positive("Preço inválido").optional(),
  isPublic: z.boolean(),
});

const step3Schema = z.object({
  departureTime: z.string().min(1, "Informe a data/hora de partida"),
  arrivalEstimate: z.string().min(1, "Informe a estimativa de chegada"),
  totalCapacity: z.coerce.number().int().min(1, "Capacidade deve ser ao menos 1"),
  initialStatus: z.enum(["DRAFT", "SCHEDULED"]),
});

const step4Schema = z.object({
  userEmail: z.string().email("E-mail inválido"),
  cnh: z.string().trim().min(9, "CNH deve ter ao menos 9 caracteres"),
});

function toISO(localStr: string): string {
  return new Date(localStr).toISOString();
}

function SetupPage() {
  const { refreshUser } = useAuth();
  const { isAdmin, adminOrgId, roleLoading, refetchRole } = useRole();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  const [orgId, setOrgId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && isAdmin && adminOrgId && step === 1 && !submitting) {
      navigate({ to: "/organizations", replace: true });
    }
  }, [roleLoading, isAdmin, adminOrgId, step, submitting, navigate]);

  const [form1, setForm1] = useState({
    organizationName: "",
    cnpj: "",
    organizationEmail: "",
    organizationTelephone: "",
    address: "",
    slug: "",
  });

  const [form2, setForm2] = useState({
    departurePoint: "",
    destination: "",
    stops: ["", ""],
    shift: "MORNING" as Shift,
    priceOneWay: "",
    priceRoundTrip: "",
    isPublic: false,
  });

  const [form3, setForm3] = useState({
    departureTime: "",
    arrivalEstimate: "",
    totalCapacity: "",
    initialStatus: "DRAFT" as InitialStatus,
  });

  const [form4, setForm4] = useState({ userEmail: "", cnh: "" });

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const parsed = step1Schema.safeParse(form1);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; name: string; email: string };
      }>("/auth/setup-organization", { method: "POST", body: JSON.stringify(parsed.data) });
      tokenStorage.set(res);
      refreshUser();
      const orgsRes = await api<Paginated<Organization>>("/organizations/me");
      const id = orgsRes.data?.[0]?.id ?? null;
      if (!id) {
        toast.error("Não foi possível obter o ID da organização criada.");
        return;
      }
      setOrgId(id);
      refetchRole();
      toast.success("Organização criada!");
      setStep(2);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar organização");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form2,
      priceOneWay: form2.priceOneWay !== "" ? Number(form2.priceOneWay) : undefined,
      priceRoundTrip: form2.priceRoundTrip !== "" ? Number(form2.priceRoundTrip) : undefined,
    };
    const parsed = step2Schema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<TripTemplate>(`/trip-templates/organization/${orgId}`, {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setTemplateId(res.id);
      toast.success("Roteiro criado!");
      setStep(3);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar roteiro");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    const parsed = step3Schema.safeParse(form3);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await api(`/trip-instances/organization/${orgId}`, {
        method: "POST",
        body: JSON.stringify({
          tripTemplateId: templateId,
          departureTime: toISO(parsed.data.departureTime),
          arrivalEstimate: toISO(parsed.data.arrivalEstimate),
          totalCapacity: parsed.data.totalCapacity,
          initialStatus: parsed.data.initialStatus,
        }),
      });
      toast.success("Viagem criada!");
      setStep(4);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar viagem");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep4(e: React.FormEvent) {
    e.preventDefault();
    const parsed = step4Schema.safeParse(form4);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await api("/memberships/driver", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      toast.success("Motorista associado!");
      navigate({ to: "/organizations" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao associar motorista");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Configuração inicial" showTabs={false}>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <h2 className="text-lg font-semibold">Criar organização</h2>

            <div className="space-y-2">
              <Label htmlFor="orgName">Nome da organização</Label>
              <Input
                id="orgName"
                value={form1.organizationName}
                onChange={(e) => setForm1((f) => ({ ...f, organizationName: e.target.value }))}
                placeholder="Ex: Transportes XYZ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={form1.cnpj}
                onChange={(e) => setForm1((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="12345678000199"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgEmail">E-mail</Label>
              <Input
                id="orgEmail"
                type="email"
                value={form1.organizationEmail}
                onChange={(e) => setForm1((f) => ({ ...f, organizationEmail: e.target.value }))}
                placeholder="contato@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgPhone">Telefone</Label>
              <Input
                id="orgPhone"
                value={form1.organizationTelephone}
                onChange={(e) => setForm1((f) => ({ ...f, organizationTelephone: e.target.value }))}
                placeholder="11999999999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={form1.address}
                onChange={(e) => setForm1((f) => ({ ...f, address: e.target.value }))}
                placeholder="Rua Exemplo, 123 — São Paulo, SP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={form1.slug}
                onChange={(e) =>
                  setForm1((f) => ({
                    ...f,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                placeholder="transportes-xyz"
                required
              />
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas, números e hífens.
              </p>
            </div>

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? "Criando…" : "Próximo"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <h2 className="text-lg font-semibold">Criar roteiro de viagem</h2>

            <div className="space-y-2">
              <Label htmlFor="depPoint">Ponto de partida</Label>
              <Input
                id="depPoint"
                value={form2.departurePoint}
                onChange={(e) => setForm2((f) => ({ ...f, departurePoint: e.target.value }))}
                placeholder="Terminal Rodoviário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dest">Destino</Label>
              <Input
                id="dest"
                value={form2.destination}
                onChange={(e) => setForm2((f) => ({ ...f, destination: e.target.value }))}
                placeholder="Universidade Federal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Paradas (mín. 2)</Label>
              {form2.stops.map((stop, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={stop}
                    onChange={(e) =>
                      setForm2((f) => ({
                        ...f,
                        stops: f.stops.map((s, idx) => (idx === i ? e.target.value : s)),
                      }))
                    }
                    placeholder={`Parada ${i + 1}`}
                  />
                  {form2.stops.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm2((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setForm2((f) => ({ ...f, stops: [...f.stops, ""] }))}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar parada
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Turno</Label>
              <Select
                value={form2.shift}
                onValueChange={(v) => setForm2((f) => ({ ...f, shift: v as Shift }))}
              >
                <SelectTrigger id="shift" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Manhã</SelectItem>
                  <SelectItem value="AFTERNOON">Tarde</SelectItem>
                  <SelectItem value="EVENING">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="priceOneWay">Preço ida (R$)</Label>
                <Input
                  id="priceOneWay"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form2.priceOneWay}
                  onChange={(e) => setForm2((f) => ({ ...f, priceOneWay: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRoundTrip">Preço ida/volta (R$)</Label>
                <Input
                  id="priceRoundTrip"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form2.priceRoundTrip}
                  onChange={(e) => setForm2((f) => ({ ...f, priceRoundTrip: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isPublic"
                type="checkbox"
                checked={form2.isPublic}
                onChange={(e) => setForm2((f) => ({ ...f, isPublic: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <Label htmlFor="isPublic">Visível publicamente</Label>
            </div>

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? "Criando…" : "Próximo"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-4">
            <h2 className="text-lg font-semibold">Criar instância de viagem</h2>

            <div className="space-y-2">
              <Label htmlFor="depTime">Data e hora de partida</Label>
              <Input
                id="depTime"
                type="datetime-local"
                value={form3.departureTime}
                onChange={(e) => setForm3((f) => ({ ...f, departureTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">Estimativa de chegada</Label>
              <Input
                id="arrival"
                type="datetime-local"
                value={form3.arrivalEstimate}
                onChange={(e) => setForm3((f) => ({ ...f, arrivalEstimate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade total</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={form3.totalCapacity}
                onChange={(e) => setForm3((f) => ({ ...f, totalCapacity: e.target.value }))}
                placeholder="Ex: 40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initStatus">Status inicial</Label>
              <Select
                value={form3.initialStatus}
                onValueChange={(v) =>
                  setForm3((f) => ({ ...f, initialStatus: v as InitialStatus }))
                }
              >
                <SelectTrigger id="initStatus" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="SCHEDULED">Agendada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? "Criando…" : "Próximo"}
            </Button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleStep4} className="space-y-4">
            <h2 className="text-lg font-semibold">Associar motorista</h2>
            <p className="text-sm text-muted-foreground">
              Informe o e-mail e a CNH do motorista para vinculá-lo à organização.
            </p>

            <div className="space-y-2">
              <Label htmlFor="driverEmail">E-mail do motorista</Label>
              <Input
                id="driverEmail"
                type="email"
                value={form4.userEmail}
                onChange={(e) => setForm4((f) => ({ ...f, userEmail: e.target.value }))}
                placeholder="motorista@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnh">CNH</Label>
              <Input
                id="cnh"
                value={form4.cnh}
                onChange={(e) => setForm4((f) => ({ ...f, cnh: e.target.value }))}
                placeholder="123456789"
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? "Associando…" : "Associar motorista"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate({ to: "/organizations" })}
            >
              Pular
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
