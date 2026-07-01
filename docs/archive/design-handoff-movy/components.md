# Componentes compartilhados — movy

Átomos usados em várias telas. Implementar antes de começar as telas.

---

## `Phone`

Container raiz de toda tela. 390×844, fundo `bg`, font Manrope, antialiased.

## `TopBar({ title, back, action })`

- Posição: sticky top, zIndex 5
- Fundo: `surface` + border-bottom 1px `line`
- Padding: `14px 18px 12px`
- Layout flex space-between
- Esquerda: botão `back` (arrow-left, opcional) + `title` (19px / 800 / -0.3)
- Direita: `action` (slot livre, geralmente botão pill) + ícone logout (sempre)

## `Scroll`

Wrapper de conteúdo entre top bar e bottom nav. `position absolute; top:56; bottom:78; overflow:auto`.

## `BottomNav({ active, onChange })`

- Posição: absolute bottom 0
- Fundo: `surface` + border-top
- Padding: `8px 6px 14px`
- Grid 5 colunas iguais
- Itens: Dashboard (grid), Viagens (bus), Templates (doc), Empresa (building), Perfil (user)
- Item ativo: cor `accent`, label 700, ícone num "pill" com fundo `accentSoft` (`padding 4px 12px; radius 99`)
- Item inativo: cor `muted`, label 500

## `Card({ children, style })`

`background: surface; border: 1px solid line; border-radius: 14; padding: 14`.

## `Bar({ value, max, color, height=6 })`

Barra de progresso. Track `lineSoft`, fill `color` (default `accent`). Border-radius 99, transition width.

## `StatusPill({ status })`

Pill com ponto colorido + label. Status válidos: `Agendada` / `Confirmada` / `Cancelada` / `Rascunho` / `Finalizada`. Ver `tokens.md` para cores.

## `Route({ from, to, big })`

Linha "Origem → Destino" visual com dois pontos (origem aro, destino preenchido accent) ligados por linha tracejada com ícone de ônibus no meio. Labels "ORIGEM" / "DESTINO" em uppercase 10px acima dos nomes.

## `Timeline({ from, to, departure, arrival, paradas })`

Versão vertical do Route com paradas intermediárias. Usado APENAS na tela 05 (Detalhe da viagem). Linha vertical tracejada à esquerda; cada parada é um marcador (12px círculo aberto para origem, 12px preenchido com halo para destino, 7px sólido cinza para paradas).

## `InfoRow({ icon, label, value, last })`

Linha de info dentro de Card.

- Padding `10px 0`
- Border-bottom `lineSoft` (exceto `last`)
- Layout flex: ícone (15px, muted) · label uppercase (11px / 600 / 70px width) · value (13px / 600, alinhado direita via margin-left auto)

## `Action({ icon, label, hint, last })`

Linha clicável (botão full-width) dentro de Card. Mesma estrutura de InfoRow, mas com:

- Ícone num container 32×32 radius 8 fundo `surface2`
- Label 14px / 700 + hint 11px / muted abaixo
- Chevron à direita

## `Field({ label, hint, value, icon })`

Campo readonly "fake select". Label uppercase em cima; container `surface2` border `line` radius 10 padding `10px 12px` com value mono à esquerda e ícone (chevron-down por padrão) à direita.

## Form atoms (telas 06 / 07)

- **`FormLabel`** — 12px / 700 / -0.1
- **`Input`** — borda `line` radius 10, padding interno 12px, font 13px / 600
- **`Select`** — visual idêntico ao Input mas com chevron-down à direita
- **`Hint`** — texto 11px / muted abaixo do campo
- **`Check`** — checkbox 18×18 radius 5 (preenche com `ink` quando checked, check branco dentro)

## `ModalPhone`

Bottom sheet por cima de uma tela escurecida.

- Background dim: `rgba(15,15,20,0.42)` sobre a tela "behind"
- Sheet: surface, border-radius top 22, shadow `0 -8px 30px rgba(0,0,0,0.18)`
- Drag handle no topo: 38×4 radius 99 cor `line`
- Header com título 17px/800 + botão X (28×28 radius 99 fundo `lineSoft`)
- Body scrollável
- CTA fixa no rodapé com border-top `lineSoft`

---

Referência exata: `source/screens.jsx` (TopBar, BottomNav, Card, Bar, StatusPill, Route, Phone, Scroll, Field, InfoRow, InfoRow2, Action) e `source/screens-extra.jsx` (Timeline, ModalPhone, FormLabel, Input, Select, Hint, Check, StopRow, PriceCol).
