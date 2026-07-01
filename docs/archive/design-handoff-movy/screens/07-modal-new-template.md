# 07 · Modal — Novo template (bottom sheet)

**Propósito.** Criar um template de rota recorrente (base para gerar viagens futuras automaticamente).

**Arquivo fonte.** `source/screens-extra.jsx` → `ModalNewTemplate`.

---

## Layout geral

Padrão `ModalPhone` (ver components.md):

- Tela `Templates` desbotada atrás
- Sheet sobe a partir de `top: 56` (quase tela cheia — o form é longo)
- Mesmo chrome: drag handle + header "Novo template" + X
- CTA rodapé: "+ Criar template"

---

## Form (vertical stack, gap 16)

### Grid 2 colunas — Origem / Destino

- 2 `Input`: placeholder "Terminal" / "Universidade"

### Turno (segmented 4 opções)

- Manhã (ativo) · Tarde · Noite · Madrug.
- Padrão segmented: container `surface2` radius 10 padding 3px

### Grid 2 colunas — Partida / Chegada

- 2 `Input` mono, placeholder "--:--", suffix ícone clock 13 muted
- Hint comum embaixo: "Horários em Brasília (UTC−3). Se a viagem cruza meia-noite, a chegada pode ser anterior à partida."

### Capacidade padrão

- `Input` mono, placeholder "20", suffix "assentos"

### Grid 2 colunas — Motorista padrão / Veículo padrão

- Ambos `Select` placeholder "Nenhum"
- Hint embaixo: "Defina os dois pra publicar viagens automaticamente sem revisão."

### Paradas (lista dinâmica)

Header row:

- FormLabel "Paradas · mín. 2" (sufixo muted "· mín. 2")
- Botão "+ Adicionar" ghost cor `accent` 12/700

Cada parada (`StopRow`):

```
[1] [Input: Ex: Rodoviária]                [X]
```

- Numerador 22×22 radius 99 bg `lineSoft` cor `ink2`, mono 11/800
- Input flex 1
- Botão X 32×32 radius 8 border `line` cor muted

Padrão: começar com 3 linhas (Rodoviária, Centro, Universidade — só placeholders).

### Preços (grid 3 colunas)

Cards iguais, `PriceCol`:

- bg `surface2` (ou `accentSoft` para "Ida + volta" destacado)
- border `line` (ou `${accent}33` quando accent)
- radius 10, padding `10px 12px`
- Label uppercase 10/700 (muted, ou accent)
- Valor: "R$ " 10/700 + número 16/800/-0.5/mono

3 cards:

1. Ida — R$ 12,00
2. Volta — R$ 12,00
3. **Ida + volta** — R$ 20,00 (accent destacado)

### Bloco de opções (card de checkboxes)

bg `surface2`, border `line`, radius 12, padding 14, gap 12.

3 checkboxes (`Check` componente):

1. ✓ **Visível no marketplace** — "Apareça na busca pública pra novos passageiros."
2. ✓ **Recorrente** — "O agendamento automático gera essas viagens periodicamente."
3. ☐ **Auto-cancelar se receita mínima não for atingida** — "Cancela viagens com baixa inscrição até 30min antes da partida."

Padrão Check: caixa 18×18 radius 5, marcada `bg ink + check branco`, desmarcada `border line transparent`.

---

## Comportamento

- Adicionar/remover paradas (mín. 2, sem máximo prático).
- Ao salvar: cria template + se "Recorrente" estiver ativo, gera primeiras N viagens via job agendado.
- Preço Ida+volta é o que rege a métrica de "receita estipulada" no dashboard (não calcular automaticamente).
- Validar: origem ≠ destino, ≥2 paradas, partida e chegada preenchidas.
