# 06 · Modal — Nova viagem (bottom sheet)

**Propósito.** Criar uma nova viagem a partir de um template.

**Arquivo fonte.** `source/screens-extra.jsx` → `ModalNewTrip`.

---

## Layout geral

Padrão `ModalPhone` (ver components.md):

- Tela `02-viagens` desbotada atrás, com overlay `rgba(15,15,20,0.42)`
- Sheet ancorada no rodapé, sobe a partir de `top: 90` (cobre ~88% da altura)
- Sheet: bg `surface`, border-radius topo 22, shadow `0 -8px 30px rgba(0,0,0,0.18)`
- Drag handle 38×4 cor `line`
- Header com título "Nova viagem" 17/800 + botão X 28×28 radius 99 bg `lineSoft`
- Body scrollável padding `16px 18px 12px`
- CTA fixa no rodapé: bg `ink`, color branco, "+ Criar viagem"

---

## Form (vertical stack, gap 16)

### Template de rota

- FormLabel "Template de rota"
- `Select` placeholder "Selecione um template…" com ícone list à esquerda

### Data de partida

- FormLabel "Data de partida" + hint à direita "O horário vem do template"
- `Input` mono, placeholder "dd/mm/aaaa"

### Capacidade total

- FormLabel "Capacidade total"
- `Input` mono, placeholder "40", suffix "assentos"

### Status inicial (segmented control)

- 2 opções: **Rascunho** (ativo por padrão) / **Agendada**
- Padrão segmented: container `surface2` border radius 10 padding 3px gap 4
- Hint embaixo: "Rascunho não aparece pra passageiros até você publicar."

### Grid 2 colunas (motorista / veículo)

- Motorista — `Select` placeholder "Sem motorista", ícone user
- Veículo — `Select` placeholder "Sem veículo", ícone bus

### Aviso destacado (callout)

- Card bg `accentSoft`, border `${accent}22`, radius 10, padding `10px 12px`
- Row flex: ícone alert 14 `accent` + texto 11 lineheight 1.45:
  > "Sem motorista e veículo, a viagem fica como **Rascunho** até você completar."

---

## Comportamento

- Selecionar template → preenche origem, destino, horário (read-only fora do modal).
- Validar: data obrigatória, capacidade > 0.
- CTA "Criar viagem":
  - Com motorista + veículo → status `Agendada`
  - Sem motorista OU veículo → status forçado a `Rascunho` (sobrescreve seleção)
  - Fecha modal + insere card no topo da lista da tela 02.
- X ou tap fora → fecha sem salvar.
- Drag handle → swipe down para fechar (gesture nativo iOS).
