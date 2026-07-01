# 08 · Relatório do mês — Financeiro em foco (variação A)

**Propósito.** Tela dedicada acessada pelo botão "Ver relatório completo →" no dashboard. Foco em **dinheiro**: receita, breakdown por status, comparação mensal, projeção.

**Arquivo fonte.** `source/screens-dashboard.jsx` → `ScreenDashboardReport`.

---

## Estrutura (top → bottom)

1. **Top bar** — "Relatório do mês" + back + **seletor de período** (pill ghost com chevron, ex.: "Maio 2026").
2. **Hero — Receita do mês** (card escuro com breakdown stacked).
3. **Gráfico — Receita por semana** (bar chart).
4. **Viagens do mês — 4 cards 2×2** (Realizadas / Confirmadas / Agendadas / Canceladas).
5. **Strip KPIs** (Passageiros · Ocup. média · Ticket médio).
6. **Top rotas.**
7. **Calendário financeiro** (próximas entradas/saídas).
8. **Botão "Exportar (.csv)".**

Gap 12 entre blocos.

---

## Hero — Receita do mês

bg `ink`, color branco, radius 18, padding 16.

```
RECEITA DO MÊS
R$ 5.840,00              ← R$ 16, número 38 mono, ,00 menor
[+18,2%] vs R$ 4.940,00 em abril   ← chip verde rgba(127,212,157,0.12)

═══════════════════════════════════════   ← barra stacked 8px radius 99
  Confirmada       Pendente   Perdida
  ▇ R$ 4.120,00   ░ 1.280,00 ░ 440,00     ← legenda 3 colunas
```

- Delta chip: `display inline-flex; gap 3; color #7fd49d; bg rgba(127,212,157,0.12); padding 2px 7px; radius 99; font 11/700` + ícone trending.
- Barra stacked: container `rgba(255,255,255,0.08)`, 3 segmentos com `flex` proporcional ao valor:
  - Confirmada — `accent`
  - Pendente — `rgba(255,255,255,0.55)`
  - Perdida — `rgba(255,255,255,0.18)` (opacidade 0.6 na legenda também)
- Legenda: 3 colunas equally flex, cada uma com square 8×8 radius 2 + label uppercase 10/0.7 + valor mono 12/800 ("R$ " em 0.55 + número).

## Receita por semana (Card)

Header row:

- Esquerda: label "RECEITA POR SEMANA" + título "Aceleração na última semana" 14/800
- Direita: segmented mini "Semana / Dia" (segmented com aba ativa shadow)

Chart:

- Altura 110, gap 10 entre colunas
- Cada coluna:
  - Valor mono "R$ X" em cima (10/700, accent se é a coluna ativa/última, senão `ink2`)
  - Barra com altura proporcional, radius `6px 6px 2px 2px`
  - Última coluna em `accent`, demais em `lineSoft` com border `line`
- Border-bottom tracejado (line) no chart
- Labels "Sem 1 · Sem 2 · Sem 3 · Sem 4" abaixo (10/700/muted)

## Viagens do mês — 4 cards 2×2 (`TripStatCard`)

SectionTitle: "Viagens do mês · 35 no total" + "Ver lista →"

Grid 2×2, gap 8. Cada card padding 12 `surface` border `line` radius 14:

- Pill no topo: bg + cor por tom + ponto + label uppercase 10/800 (`Realizadas` / `Confirmadas` / `Agendadas` / `Canceladas`)
- Número mono 30/800/-1.2 abaixo
- Sub 11/muted: "já aconteceram" / "prontas pra rodar" / "aguardando inscritos" / "R$ 440,00 perdidos"

Tons:

- success (verde) — Realizadas
- info (azul) — Confirmadas
- muted (cinza) — Agendadas
- danger (vermelho) — Canceladas

## Strip KPIs

Card único radius 14 com 3 colunas (divider vertical `1px lineSoft` entre elas).

Cada coluna `MiniKPI`:

- Ícone 12 + label uppercase 10/700/muted
- Valor 18/800/-0.5/mono

3 KPIs:

- Passageiros — `187` (ícone users)
- Ocup. média — `62%` (ícone pct)
- Ticket médio — `R$ 31` (ícone money)

## Top rotas

SectionTitle: "Top rotas · Maior receita" + "Ver todas →"

Card `padding 4` com lista `RouteRow`. Cada row:

- Rank 22×22 radius 6 mono 11/800 (rank 1: bg `accent` color `accentInk`; demais: bg `lineSoft` cor `ink2`)
- Bloco vertical:
  - Nome rota 13/700 ("Campo Maior → Piripiri")
  - Sub 11/muted ("12 viagens · ocup. 78%")
- Valor à direita: mono 13/800 ("R$ " muted/600 + valor)

3 rotas (mockadas):

1. Campo Maior → Piripiri — 12 viagens · 78% — R$ 3.840,00
2. Piripiri → Campo Maior — 5 viagens · 54% — R$ 1.480,00
3. Especial fim-de-semana — 1 viagem · 41% — R$ 520,00

## Calendário financeiro

SectionTitle: "Calendário financeiro · Próximos 14 dias"

Card `padding 4` com lista `UpcomingRow`. Cada row:

- Box de data 38×38: `surface2` border `line` radius 10, mês uppercase 9/700/muted em cima + dia 14/800/mono embaixo
- Bloco vertical: label 13/700 + tipo uppercase 11/700 (`Entrada` em `success`, `Saída` em `warn`)
- Valor mono 14/800: `+R$ X` em `success` (entrada) ou `−R$ X` em `danger` (saída)

3 itens (mockados):

- 28/05 — Repasse semanal — `+R$ 1.840,00`
- 01/06 — Mensalidade plano Pro — `−R$ 79,00`
- 04/06 — Repasse semanal — `+R$ 2.120,00`

## Exportar

Botão full width, bg `surface`, border `line`, color `ink`, padding 12, radius 12, font 13/700, ícone doc 15 + "Exportar relatório (.csv)".

---

## Comportamento

- Seletor de período (top bar) → bottom sheet com lista de meses.
- "Ver lista →" → tela `02-viagens` com filtro do mês aplicado.
- "Ver todas →" (top rotas) → lista de rotas (fora do escopo).
- Exportar → download CSV nativo.
