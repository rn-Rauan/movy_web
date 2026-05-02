# Componentes — movy_web

## Layout

### `AppShell`

**Arquivo:** `src/components/layout/AppShell.tsx`

Componente de layout principal. Fornece cabeçalho fixo, área de conteúdo com largura máxima e navega inferior por role.

### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | — | Título exibido no cabeçalho |
| `back` | `boolean` | `false` | Se `true`, exibe botão de voltar (`router.history.back()`) |
| `children` | `React.ReactNode` | — | Conteúdo da página |
| `showTabs` | `boolean` | `true` | Se `false`, oculta o `BottomNav` |

### Comportamento

- **Header:** Sticky, altura `h-14`. Exibe título, botão voltar (opcional) e botão de logout (se autenticado).
- **Main:** `max-w-md`, `px-4 py-4 pb-24`.
- **BottomNav:** Renderizado condicionalmente via `{showTabs && <BottomNav />}`. O próprio `BottomNav` oculta se não autenticado ou durante `roleLoading`.

```tsx
<AppShell title="Minhas inscrições">
  {/* conteúdo */}
</AppShell>

<AppShell title="Detalhes" back showTabs={false}>
  {/* página de detalhe sem tabs */}
</AppShell>
```

---

### `BottomNav`

**Arquivo:** `src/components/layout/BottomNav.tsx`

Navegação inferior por abas. Exibe tabs diferentes de acordo com o role detectado. Retorna `null` se não autenticado ou durante `roleLoading`.

**Tabs — Passenger/Driver:**

| Tab | Ícone | Rota |
|---|---|---|
| Explorar | Compass | `/public/trip-instances` |
| Empresas | Building2 | `/_protected/organizations` |
| Inscrições | Ticket | `/_protected/my-bookings` |

**Tabs — Admin:**

| Tab | Ícone | Rota |
|---|---|---|
| Explorar | Compass | `/public/trip-instances` |
| Viagens | Building2 | `/_protected/trips/:adminOrgId` |
| Configurar | Settings2 | `/_protected/setup` |

---

## Feedback

### `LoadingList`

**Arquivo:** `src/components/feedback/LoadingList.tsx`

Skeletons de lista para estados de carregamento.

```tsx
<LoadingList />                    // 3 skeletons de h-24
<LoadingList count={5} height="h-40" />
```

| Prop | Tipo | Padrão |
|---|---|---|
| `count` | `number` | `3` |
| `height` | `string` | `"h-24"` |

---

### `ErrorCard`

**Arquivo:** `src/components/feedback/ErrorCard.tsx`

Card de erro simples.

```tsx
<ErrorCard message={error} />
```

---

## Padrão de Feature Component

Componentes de feature **recebem dados via props** — não fazem fetch próprio.

```tsx
// Rota thin — busca e passa props
function TripsPage() {
  const { orgId } = Route.useParams();
  const { trips, loading, error } = useTrips({ orgId });
  return (
    <AppShell title="Viagens" back>
      {loading ? <LoadingList /> : error ? <ErrorCard message={error} /> : <TripsList trips={trips ?? []} orgId={orgId} />}
    </AppShell>
  );
}

// Componente de feature — só apresentação
function TripsList({ trips, orgId }: { trips: TripInstance[]; orgId: string }) {
  if (trips.length === 0) return <Card className="p-4 text-center text-muted-foreground">Nenhuma viagem</Card>;
  return <div className="space-y-3">{trips.map((t) => <TripCard key={t.id} trip={t} orgId={orgId} />)}</div>;
}
```

---

## Componentes de Feature

### trips

| Componente | Descrição |
|---|---|
| `TripCard` | Card compacto — lista privada |
| `TripsList` | Lista com links para detalhe |
| `PublicTripCard` | Card rico do marketplace (botões "ver empresa"/"ver viagem") |
| `TripDetailView` | Detalhe completo + botão de inscrição |

### bookings

| Componente | Descrição |
|---|---|
| `BookingCard` | Card de inscrição na lista |
| `BookingsList` | Lista com empty state |
| `BookingDetailView` | Detalhe + AlertDialog de cancelamento |

### organizations

| Componente | Descrição |
|---|---|
| `OrgCard` | Card de empresa |
| `OrgsList` | Lista com links para trips |

---

## Componentes UI (shadcn/ui)

Todos em `src/components/ui/`. Baseados em **Radix UI**. **Não modificar diretamente** — atualizar via CLI:

```bash
bunx shadcn@latest add <nome>
```

### Componentes utilizados

| Componente | Uso |
|---|---|
| `Button` | CTAs em toda a aplicação |
| `Input` | Campos de formulário |
| `Label` | Rótulos de campos |
| `Card` | Containers de conteúdo |
| `Badge` | Status de viagens e inscrições |
| `Skeleton` | Placeholders (via `LoadingList`) |
| `Select` | Tipo de viagem, pagamento |
| `AlertDialog` | Confirmação de cancelamento |
| `Separator` | Divisores visuais |
| `Sonner` (Toaster) | Notificações de feedback |

### Variantes de Badge por status

| Status | Variante |
|---|---|
| `CONFIRMED`, `IN_PROGRESS` | `default` |
| `SCHEDULED` | `secondary` |
| `CANCELED` | `destructive` |
| `DRAFT`, `FINISHED` | `outline` |

---

## Hooks Customizados

### `useIsMobile`

**Arquivo:** `src/hooks/use-mobile.tsx`

Detecta se viewport < 768px. Reativo a mudanças de janela.

```tsx
const isMobile = useIsMobile(); // boolean
```

---

## Padrões de UI Recorrentes

### Loading / Error / Conteúdo

```tsx
{loading ? (
  <LoadingList />
) : error ? (
  <ErrorCard message={error} />
) : (
  <MeuComponente data={data} />
)}
```

### Estado Vazio

```tsx
{items.length === 0 && (
  <Card className="p-6 text-center text-muted-foreground">
    Nenhum item encontrado.
  </Card>
)}
```

### Toast de Feedback

```tsx
import { toast } from "sonner";

toast.success("Inscrição realizada!");
toast.error(err instanceof Error ? err.message : "Erro desconhecido");
```

Toasts configurados na raiz com `position="top-center" richColors`.
