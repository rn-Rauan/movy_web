# 09 · Relatório do mês — Operação em foco (variação B)

**Propósito.** Alternativa à tela 08, com foco em **viagens** (operação) em vez de dinheiro puro. Dono que pensa "rodei muito?" antes de "ganhei muito?".

**Arquivo fonte.** `source/screens-dashboard.jsx` → `ScreenDashboardReportOps`.

---

## Estrutura (top → bottom)

1. **Top bar** — igual à 08 (back + seletor de período).
2. **Hero dividido** — viagens realizadas (esquerda) + receita (direita) + barra segmentada de status.
3. **Heatmap diário** (4 semanas × 7 dias, intensidade = receita).
4. **Detalhamento — 4 cards 2×2.**
5. **Top rotas.**

Sem KPI strip, sem calendário financeiro, sem export (a ideia é uma view operacional mais enxuta).

---

## Hero dividido

bg `surface`, border `line`, radius 18, padding 16.

Layout row gap 12 com **divider vertical 1px `lineSoft`** entre as duas colunas:

**Coluna esquerda (Viagens realizadas):**

- Label uppercase "VIAGENS REALIZADAS" 11/700/muted
- Número grande mono **38/800/-1.5**: `18` + "de 35" em 13 muted
- Sub: "**187** passageiros · ocup. **62%**" (187 em `success` 800, 62% em `ink` 800)

**Coluna direita (Receita):**

- Label uppercase "RECEITA"
- "R$ " 12 muted/700 mono + valor 24/800/-0.8/mono ("5.840")
- Delta inline: ícone trending + "+18,2% vs abril" cor `success` 11/700

### Barra segmentada de status (abaixo das colunas)

Label "STATUS DAS VIAGENS" 10/700/muted/uppercase.

Container row altura 26 radius 8 border `line`, 4 segmentos com `flex` proporcional à contagem.

Cada segmento (`StatusSegment`):

- Cor de fundo por status:
  - Realizadas — `success`
  - Confirmadas — `info`
  - Agendadas — `muted`
  - Canceladas — `danger`
- Divisor 1px `surface` entre segmentos
- Texto branco centralizado: número 12/800/mono + sigla 8/700 uppercase ("Real." / "Confir." / "Agend." / "Cancel.")
- `min-width 28` para garantir leitura mesmo quando segmento é pequeno

## Heatmap — Receita diária do mês (Card)

Header:

- Esquerda: label "RECEITA DIÁRIA · MÊS" + título "Quintas concentram a maior receita" 14/800
- Direita: legenda inline "Menos · ▢▢▢▢ · Mais" (4 quadrados 10×10 radius 2 cor `accent` opacities 0.12/0.3/0.55/0.85)

Grid CSS `grid-template-columns: auto repeat(7, 1fr)`, gap 4, alinhamento centro.

Layout:

```
       D  S  T  Q  Q  S  S
S1   [·][·][·][·][·][·][·]
S2   [·][·][·][·][·][·][·]
S3   [·][·][·][·][·][·][·]
S4   [·][·][·][·][·][·][·]
```

Cada célula:

- `aspect-ratio: 1`, radius 4
- Vazia (sem viagem): bg `lineSoft`, opacidade 1
- Com viagem: bg `accent`, opacidade `0.12 + (valor / max) * 0.88` (escala suave)
- `title` attribute com valor em R$ para hover (acessível em desktop)

Labels dias da semana (10/700/muted/text-center) no topo.
Labels semanas (S1...S4) à esquerda (10/600/muted).

## Detalhamento — 4 cards 2×2

Idêntico ao bloco da tela 08 (mesmo componente `TripStatCard`). Subtextos:

- Realizadas — "R$ 3.320,00 pago"
- Confirmadas — "prontas pra rodar"
- Agendadas — "aguardando inscritos"
- Canceladas — "3 por baixa inscrição"

## Top rotas

Idêntico ao bloco da tela 08 (`RouteRow`).

---

## Comparativo 08 vs 09

|                       | 08 Financeiro      | 09 Operação                     |
| --------------------- | ------------------ | ------------------------------- |
| Hero principal        | Receita total      | Viagens realizadas              |
| Comparação mensal     | Destaque grande    | Inline no canto                 |
| Breakdown status      | Stacked bar com R$ | Segmented bar com contagem      |
| Gráfico               | Bar chart semanal  | Heatmap diário (4 sem × 7 dias) |
| Calendário financeiro | ✓                  | —                               |
| Strip KPIs            | ✓                  | —                               |
| Export                | ✓                  | —                               |

**Recomendação.** Tela 08 para a maioria dos donos (pensam em $); tela 09 para operadores que rodam frota grande. **Implementar uma só** — não fazer toggle. Pode-se evoluir para uma terceira tela combinando os dois ângulos no futuro.
