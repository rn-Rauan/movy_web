# 05 · Detalhe da viagem

**Propósito.** Ver tudo sobre uma viagem específica e tomar ação (confirmar / cancelar).

**Arquivo fonte.** `source/screens-extra.jsx` → `ScreenTripDetail`.

---

## Estrutura (top → bottom)

1. **Top bar** — "Detalhe da viagem" + back + ícone share (direita).
2. **Card hero** (data, horário, timeline visual, ocupação).
3. **Card Motorista.**
4. **Card Veículo.**
5. **Card Inscrições** (empty state ou lista).
6. **Sticky action bar** no rodapé: [X cancelar] [✓ Confirmar viagem].

Gap 12.

> A `Scroll` aqui tem `bottom: 90` (não 78) para abrir espaço para a action bar de 70px de altura.

---

## Card hero

bg `surface`, border `line`, radius 18, padding 16.

Header (flex row, space-between):

- Esquerda:
  - Label "QUINTA · 22 DE MAIO" — 11px / 700 / muted / uppercase
  - Hora de partida grande: "20:00" — **36px / 800 / -1.5 / mono / lineheight 1**
  - "⏱ Chega às 21:00" — 12px muted, "21:00" em mono `ink2`
- Direita: StatusPill (Agendada / Confirmada / etc)

### Timeline vertical

Logo abaixo do header, dentro do mesmo card.

Layout: linha vertical tracejada à esquerda (`borderLeft 2px dashed line`), eventos cronológicos a cada 14px de gap.

Cada evento:

- Marcador (20px container, vertical-aligned com texto):
  - **Origem (start):** círculo 12×12 aro 2.5px `ink`, fundo `surface`
  - **Parada (stop):** ponto 7×7 sólido `muted` com halo 3px `surface`
  - **Destino (end):** círculo 12×12 sólido `accent` com halo 3px `accentSoft`
- Texto: nome (13 ou 15px / 600 ou 800) + subtítulo (11px muted). Subtítulo de origem/destino é mono "Partida · 20:00" / "Chegada · 21:00".
- Pill à direita: "ORIGEM" (lineSoft / ink2) ou "DESTINO" (accentSoft / accent), 10px/700.

### Ocupação (footer do hero)

Divider tracejado top, depois flex row:

- Ícone users 16 + (flex 1):
  - Label "Ocupação" 12px muted + contador mono "0 / 30 lugares" à direita (Y em muted/500)
  - Bar abaixo, cor `accent`

---

## Card Motorista

Header com SectionLabel (`SectionLabel` componente: ícone id 14 + "MOTORISTA" 11/700 uppercase muted).

Conteúdo: row flex 12 padding `10px 0 4px`:

- Avatar 44×44 radius 12 bg `accentSoft` cor `accent` font 16/800 (inicial "A")
- Bloco vertical:
  - Nome 15/800 inline com pill "● Ativo" (successSoft / success) se ativo
  - Linha mono 11 muted: "CNH 123456789 · Cat. A, D · Val. 29/10/2026"
- Botão swap 32×32 border `line` radius 8 cor muted à direita

## Card Veículo

Mesma estrutura. Diferenças:

- SectionLabel: ícone bus + "VEÍCULO"
- Avatar 44×44 radius 12 cor amarelo `#fef3c7` / `#92580a`, ícone bus 20
- Nome 15/800 ("Onibus Jacintu's amarelo")
- Linha de detalhe: placa em badge mono (`bg lineSoft cor ink2 padding 2px 6px radius 4`) + "30 assentos"

## Card Inscrições

Header row (justify space-between):

- SectionLabel `compact` (sem margem inferior): ícone ticket + "INSCRIÇÕES"
- Contador mono 11/700/muted "0 / 30" à direita

Empty state:

- Container interno bg `surface2` border DASHED `line` radius 10 padding `20px 16px` text-center
- Ícone users 22 muted
- "Nenhum passageiro ainda" 13/700 `ink2`
- "Compartilhe o link público pra começar a receber inscrições." 11 muted lineheight 1.4

> Se houver inscritos, substituir empty state por lista de passageiros (componente futuro: nome + telefone + status pagamento).

---

## Sticky action bar (rodapé)

`position: absolute; left: 0; right: 0; bottom: 0`, bg `surface`, border-top `line`, padding `10px 16px 14px`, flex gap 8.

- Botão X (46×46 radius 12, border `dangerSoft`, bg `surface`, cor `danger`) — **cancelar viagem**
- Botão "✓ Confirmar viagem" (flex 1, bg `ink`, color branco, padding 12, radius 12, font 14/800 + ícone check 16) — **confirmar**

## Comportamento

- "Confirmar" → atualiza status para `Confirmada` (pill verde) + toast de sucesso.
- "Cancelar" → abre confirmação ("Tem certeza? Os passageiros serão notificados.") → atualiza para `Cancelada`.
- Botão swap (motorista/veículo) → bottom sheet para trocar.
- Share → menu nativo de compartilhar (link + detalhes da viagem).
