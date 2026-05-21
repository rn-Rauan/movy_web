# 01 · Dashboard (Home)

**Propósito.** Visão rápida para o admin/dono. Decisões em 5 segundos: quanto vou faturar essa semana, o que sai logo, alguma viagem em risco.

**Arquivo fonte.** `source/screens.jsx` → `ScreenDashboard`.

---

## Estrutura (top → bottom)

1. **Top bar** — título "Dashboard" + ícone logout à direita.
2. **Saudação** — "Boa tarde" (uppercase 12px muted) + "Jacintos, bem-vindo" (22px / 800 / -0.5).
3. **Hero — Receita estipulada** (card escuro).
4. **Grid 2×2 — KPIs secundários.**
5. **Seção "Próximas viagens"** (header + lista de cards).
6. **Bottom nav.**

---

## Hero — Receita estipulada

Card `background: ink #1c1b1f`, color branco, radius 18, padding 16.

```
┌────────────────────────────────────────┐
│ RECEITA ESTIPULADA       [esta semana] │
│ R$ 480,00                              │  ← R$ menor, número 40px mono, ,00 menor
│ 24 de 120 vagas vendidas               │
│                                        │
│ ▁ ▃ ▁ ▄ █ ▆ ▅                          │  ← mini bar chart de receita por dia
│ Q S D S T Q Q                          │
│                                        │
│ [ ⤴ Ver relatório completo do mês →]   │  ← botão glass (rgba branco 8%)
└────────────────────────────────────────┘
```

- Receita = `totalBooked × 20` (preço ida+volta padrão).
- Pill "esta semana" à direita: `rgba(255,255,255,0.08)` radius 10, ícone trending + texto 11px/600.
- Mini chart: 7 barras (uma por dia), alturas proporcionais à receita do dia. Hoje destacado em `accent`, outros em `rgba(255,255,255,0.18)`.
- Letras dos dias: 9px / opacity 0.5.
- **Botão "Ver relatório completo"** → navega para tela `08-report-finance` (ou variação escolhida).
  - bg `rgba(255,255,255,0.08)` border `rgba(255,255,255,0.12)` radius 10 padding `10px 12px`
  - Layout flex space-between: ícone trending + texto à esquerda, arrow-right à direita

## Grid KPIs 2×2

Gap 8. Cada card padding 12. Padrão de cada card:

- Header: ícone 14 + label uppercase 11px/600/muted
- Número grande: 28px / 800 / -1 / mono
- Subtexto curto: 11px / muted
- (opcional) Barra ou stripe visual abaixo

| Card | Ícone    | Label                    | Valor                    | Subtexto                           | Visual extra                                                                   |
| ---- | -------- | ------------------------ | ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| 1    | bus      | Viagens ativas           | `4`                      | "de 5 total"                       | Bar 4/5 cor accent altura 4                                                    |
| 2    | calendar | Próximos 7 dias          | `4`                      | "partidas"                         | 7 stripes (uma por dia, accent se há viagem, lineSoft se não)                  |
| 3    | users    | Passageiros              | `24`                     | "120 vagas disponíveis"            | —                                                                              |
| 4    | alert    | **Atenção** (cor `warn`) | (texto em vez de número) | "Risco de cancelamento automático" | bg do card é `surface2`. Conteúdo: "1 viagem sem inscritos" (13px / 700 / ink) |

## Seção "Próximas viagens"

Header:

- "Próximas viagens" — h2 15px / 800 / -0.2
- "Ver todas →" à direita — botão ghost cor `accent` 12px / 700 + chevron

Lista (gap 8):

Cada item é um Card padding 12:

```
┌──────────────────────────────────────┐
│ 22/05  20:00              [Agendada] │  ← data mono 18px/800, hora 12px/600/muted
│                                      │
│ ORIGEM     ──● bus ●──   DESTINO     │  ← componente Route (ver components.md)
│ Campo Maior              Piripiri    │
│                                      │
│ ████░░░░░░░░░░░░░░░░░░░░░  8/30      │  ← barra ocupação + contador mono
└──────────────────────────────────────┘
```

- Cor da barra: `success` se >50% ocupada, senão `accent`.
- Mostrar 4 viagens.

---

## Comportamento

- Tocar no card hero → tela de relatório.
- Tocar em uma viagem → tela `05-trip-detail`.
- "Ver todas →" → tela `02-viagens`.
- Bottom nav padrão (ativo: Dashboard).

## Dados mockados (referência)

```js
trips = [
  {
    date: "22/05",
    time: "20:00",
    from: "Campo Maior",
    to: "Piripiri",
    booked: 0,
    total: 30,
    status: "Agendada",
  },
  {
    date: "25/05",
    time: "20:00",
    from: "Campo Maior",
    to: "Piripiri",
    booked: 8,
    total: 30,
    status: "Agendada",
  },
  {
    date: "26/05",
    time: "20:00",
    from: "Campo Maior",
    to: "Piripiri",
    booked: 14,
    total: 30,
    status: "Confirmada",
  },
  {
    date: "27/05",
    time: "20:00",
    from: "Campo Maior",
    to: "Piripiri",
    booked: 2,
    total: 30,
    status: "Agendada",
  },
];
week = [36, 72, 24, 96, 168, 132, 108]; // receita R$ por dia
```
