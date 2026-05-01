# Componentes — movy_web

## AppShell

**Arquivo:** `src/components/AppShell.tsx`

Componente de layout principal que envolve todas as páginas autenticadas (e algumas públicas). Fornece cabeçalho fixo, área de conteúdo com largura máxima e navegação inferior por abas.

### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | — | Título exibido no cabeçalho |
| `back` | `boolean` | `false` | Se `true`, exibe botão de voltar (usa `router.history.back()`) |
| `children` | `React.ReactNode` | — | Conteúdo da página |
| `showTabs` | `boolean` | `true` | Se `false`, oculta a navegação inferior por abas |

### Comportamento

- **Header:** Sticky no topo, altura de 56px. Exibe título, botão voltar (opcional) e botão de logout (se autenticado).
- **Main:** Área de conteúdo centralizada, `max-w-md`, com padding `px-4 py-4 pb-24`.
- **Bottom Nav:** Fixo no rodapé, visível apenas quando `isAuthenticated && showTabs`. Duas abas:
  - **Viagens** (`/organizations`) — ativo em rotas que começam com `/organizations` ou `/trips`
  - **Inscrições** (`/my-bookings`) — ativo em rotas que começam com `/my-bookings`

### Exemplo de uso

```tsx
<AppShell title="Minhas inscrições">
  {/* conteúdo */}
</AppShell>

<AppShell title="Detalhes" back showTabs={false}>
  {/* página de detalhe sem tabs */}
</AppShell>
```

---

## Componentes UI (shadcn/ui)

Todos os componentes UI estão em `src/components/ui/` e são baseados na biblioteca **shadcn/ui** com primitivos **Radix UI**. São componentes sem estado próprio de negócio — puramente visuais e acessíveis.

### Componentes utilizados nas páginas

| Componente | Arquivo | Uso no projeto |
|---|---|---|
| `Button` | `button.tsx` | CTAs em toda a aplicação |
| `Input` | `input.tsx` | Campos de formulário |
| `Label` | `label.tsx` | Rótulos de campos |
| `Card` | `card.tsx` | Containers de conteúdo e listas |
| `Badge` | `badge.tsx` | Status de viagens e inscrições |
| `Skeleton` | `skeleton.tsx` | Placeholders durante carregamento |
| `Select` | `select.tsx` | Seleção de tipo de viagem e pagamento |
| `AlertDialog` | `alert-dialog.tsx` | Confirmação de cancelamento de inscrição |
| `Separator` | `separator.tsx` | Divisores visuais |
| `Toaster` (Sonner) | `sonner.tsx` | Notificações de feedback (toasts) |

### Variantes de Badge por status

O componente `Badge` é usado com variantes mapeadas pela função `statusVariant()` de `lib/format.ts`:

| Status de Viagem | Variante do Badge |
|---|---|
| `CONFIRMED`, `IN_PROGRESS` | `default` (cor primária) |
| `SCHEDULED` | `secondary` |
| `CANCELLED` | `destructive` (vermelho) |
| `DRAFT`, `COMPLETED` | `outline` |

---

## Hooks Customizados

### `useIsMobile`

**Arquivo:** `src/hooks/use-mobile.tsx`

Detecta se o viewport é mobile (< 768px) usando `window.matchMedia`. Reativo a mudanças de tamanho de janela.

```tsx
const isMobile = useIsMobile(); // boolean
```

> Atualmente instalado mas não utilizado diretamente nas páginas — disponível para uso em componentes que precisem adaptar layout.

---

## Padrões de UI Recorrentes

### Skeleton Loading

Todas as páginas que buscam dados remotos exibem Skeletons enquanto `data === null && error === null`:

```tsx
{data === null && !error ? (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-40 w-full rounded-xl" />
    ))}
  </div>
) : error ? (
  <Card className="p-4 text-sm text-destructive">{error}</Card>
) : (
  // conteúdo real
)}
```

### Estado Vazio

Quando uma lista é carregada com sucesso mas está vazia, é exibido um `Card` centralizado com ícone e mensagem informativa.

### Toast de Feedback

Todas as ações assíncronas (login, inscrição, cancelamento) usam `sonner` para feedback:

```tsx
toast.success("Inscrição realizada!");
toast.error(err.message ?? "Falha na operação");
```

Os toasts são configurados na raiz com `position="top-center" richColors`.
