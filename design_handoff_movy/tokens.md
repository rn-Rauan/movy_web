# Design tokens — movy

## Paleta (padrão: terracotta)

```
bg          #f3eee5    fundo da tela do app
surface     #ffffff    cards, top bar, bottom nav
surface2    #faf6ed    fundo de inputs, segmented inativo

ink         #1c1b1f    texto principal, hero escuro
ink2        #4a4954    texto secundário
muted       #8a8892    labels, hints

line        #e9e2d3    bordas de cards e divisores
lineSoft    #f0ead9    divisores internos

accent       #c8553d   cor de marca (terracota)
accentInk    #ffffff   texto sobre accent
accentSoft   #f4dfd6   fundos suaves com tom accent

success      #3a7a3e   confirmada, ativo, entrada $
successSoft  #e2efde
danger       #a8281e   cancelada, sair, saída $
dangerSoft   #f3d8d3
warn         #a36810   aviso
warnSoft     #f1e1bd
info         #2a5da8   agendada
infoSoft     #dde7f4
```

## Paletas alternativas (mesma estrutura, trocar 'accent' + ajustes)

- **Oceano** — accent `#0e6b7a`, ink `#0c1a22`, bg `#eef2f4`
- **Floresta** — accent `#3d6b2e`, ink `#161a14`, bg `#f0eee4`

A escolha é tweak do usuário. Implementar como tema selecionável.

## Tipografia

Famílias:

- **Manrope** — UI principal (400 / 500 / 600 / 700 / 800)
- **JetBrains Mono** — números, códigos (placa, CNH, CPF, valores em R$, horários, datas curtas, contadores X/Y)

Escala:

```
Display hero        40-44px / weight 800 / letter -1.5  (números grandes do dashboard)
Title screen        19px   / 800 / -0.3                  (top bar)
Title section       15px   / 800 / -0.2                  (h2 "Próximas viagens")
Title card          14-16px / 800 / -0.2                 (nome da empresa, motorista)
Body                13px   / 600
Body small          12px   / 600
Caption             11px   / 600 / 0.2 spacing
Label uppercase     10-11px / 700 / 0.3-0.5 spacing TEXT-TRANSFORM:UPPERCASE
Mono number         11-44px / 700-800 / family JetBrains Mono / letter -0.3 a -1.5
```

## Espaçamentos

```
Page padding        16px (horizontal)
Card gap            8-12px (entre cards consecutivos)
Card padding        12-16px
Section gap         14-18px (entre blocos de conteúdo)
Stack inline gap    6-10px
```

## Border radius

```
Pill                999px   (chips, status, botões redondos)
Card                14px
Card hero           18px
Input / segmented   10-12px
Button              10-12px
Icon container      8-10px
```

## Botões

```
Primary (escuro)
  bg: ink #1c1b1f
  color: #fff
  padding: 12-13px
  radius: 12px
  font: 14px / 800 / -0.2

Primary (accent)
  bg: accent
  color: accentInk
  padding: 10-13px
  radius: 10-12px
  font: 13-14px / 700-800

Secondary
  bg: surface
  border: 1px solid line
  color: ink2
  font: 12-13px / 700

Ghost / icon
  bg: transparent
  color: ink ou muted
```

## Estados de status (pill)

| Status     | Cor               | Fundo                 |
| ---------- | ----------------- | --------------------- |
| Agendada   | info `#2a5da8`    | infoSoft `#dde7f4`    |
| Confirmada | success `#3a7a3e` | successSoft `#e2efde` |
| Cancelada  | danger `#a8281e`  | dangerSoft `#f3d8d3`  |
| Rascunho   | muted `#8a8892`   | lineSoft `#f0ead9`    |
| Finalizada | ink2 `#4a4954`    | lineSoft `#f0ead9`    |

Formato pill: padding `3px 8px 3px 7px`, radius 999, ponto colorido 6×6 à esquerda, label 11px/700.

## Sombras

Quase tudo é flat (só borda). Exceções:

- **Bottom sheet:** `0 -8px 30px rgba(0,0,0,0.18)` (topo)
- **Avatar hero do perfil:** `0 4px 16px ${accentSoft}`
- **Segmento ativo:** `0 1px 2px rgba(0,0,0,0.06)` (item selecionado de segmented control)

## Ícones

Inline SVG, stroke-based, 24×24 viewBox, stroke-width 1.6 (2 quando ativo).
Tamanhos comuns: 12 / 14 / 16 / 18 / 20.

Lista completa no arquivo `source/screens.jsx` (constante `I`).
