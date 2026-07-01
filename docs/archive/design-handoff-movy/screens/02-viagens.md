# 02 · Lista de viagens

**Propósito.** Encontrar uma viagem específica e ver o pipeline do mês com filtros rápidos.

**Arquivo fonte.** `source/screens.jsx` → `ScreenViagens`.

---

## Estrutura (top → bottom)

1. **Top bar** — título "Viagens" + back (esquerda) + botão pill **"+ Nova"** (direita).
   - Pill primário: bg `accent`, color `accentInk`, padding `7px 12px`, radius 99, font 12px/700, ícone plus 14px.
2. **Search** — input com ícone search à esquerda. Placeholder "Buscar por origem ou destino".
   - Borda `line`, radius 12, padding `11px 14px 11px 38px`.
3. **Segmented control de data** — 5 abas: Qualquer · Hoje · Amanhã · Esta sem. · Próx. sem.
   - Container `surface2`, radius 12, padding 3px, gap 4
   - Aba ativa: bg `surface`, shadow leve, texto 700
   - Aba inativa: transparente, texto muted 500
4. **Chips de status horizontais** (scroll horizontal, gap 6):
   - Cada chip: padding `6px 11px`, radius 99, label + número
   - Primeiro chip ativo: bg `ink`, texto branco, contador interno `rgba(255,255,255,0.15)` branco
   - Demais: bg `surface`, border `line`, texto `ink2`, contador `lineSoft` muted
   - Status: Todas (12) · Rascunho (1) · Agendada (6) · Confirmada (2) · Cancelada (2) · Finalizada (1)
5. **Header de seção** — "ESTA SEMANA · 5" (11px / 700 / muted / uppercase) + "Recentes ▼" (sort) à direita.
6. **Lista de cards de viagem** (gap 8).

---

## Card de viagem

Padding 14. Stack vertical com 3 blocos separados por linha tracejada interna:

```
┌─────────────────────────────────────────┐
│ 22/05  ⏱ 20:00              [Agendada] │  ← data mono 20px/800
│                                         │
│ ORIGEM   ──● bus ●──   DESTINO          │  ← Route
│ Campo Maior            Piripiri         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │  ← divider tracejado top 1px line
│ [A] Akinuku        ████░░░░░░░  8/30    │  ← avatar accent + nome + barra ocupação
└─────────────────────────────────────────┘
```

- Avatar do motorista: 20×20 radius 99 bg `accentSoft` cor `accent` font 10px/700 com inicial.
- Barra: `flex 1`, max-width 180, cor `success` se >50%, `accent` se <50%, `muted` se cancelada.
- Contador: mono 12px/700, formato `X/Y` (Y em muted/500).

## Comportamento

- Tap em card → tela `05-trip-detail`.
- Tap em "+ Nova" → modal `06-modal-new-trip` (sobre essa mesma tela escurecida).
- Filtros (data + status) atualizam lista in-place.
- Search filtra por origem/destino em tempo real.

## Dados mockados (referência)

```js
trips = [
  { date: '21/05', ... status: 'Cancelada', driver: 'Akinuku' },
  { date: '22/05', ... status: 'Agendada' },
  { date: '25/05', ... status: 'Agendada',  booked: 8 },
  { date: '26/05', ... status: 'Confirmada', booked: 14 },
  { date: '27/05', ... status: 'Agendada', booked: 2 },
]
```
