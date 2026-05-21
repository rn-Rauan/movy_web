# 03 · Empresa

**Propósito.** Gerenciar conta da empresa, plano, link público, automação e dados cadastrais.

**Arquivo fonte.** `source/screens.jsx` → `ScreenEmpresa`.

---

## Estrutura (top → bottom)

1. **Top bar** — "Empresa".
2. **Card de plano (hero)** — escuro, plano + uso + CTA upgrade.
3. **Card de link público** — URL + ações compartilhar/QR/abrir.
4. **Card de agendamento automático** (colapsável).
5. **Card de info da empresa** (logo, dados cadastrais).
6. **Grid 2×1 — veículo + motorista** (stats curtos).

Gap entre blocos: 14.

---

## Card de plano (hero)

bg `ink`, color branco, radius 18, padding 16.

```
┌─────────────────────────────────────┐
│ [⚡ PLANO FREE]                      │  ← pill accent
│                                     │
│ MENSALIDADE                         │
│ R$ 0,00 /mês                        │
│ Válido até 19/06, 17:25             │
│                                     │
│ 🚗 Veículos        1/1   ▓▓▓▓▓▓▓▓▓ │  ← uso (cheio = accent)
│ 👥 Motoristas      1/1   ▓▓▓▓▓▓▓▓▓ │
│ 🚌 Viagens / mês   5/5   ▓▓▓▓▓▓▓▓▓ │
│                                     │
│ [ Fazer upgrade → ]  [ Pagamentos ] │
└─────────────────────────────────────┘
```

- Pill plano: bg `accent`, padding `3px 8px`, font 10px/800 uppercase, ícone bolt.
- Valor: R$ 32px mono, "/mês" 12px opacity 0.6.
- Barras de uso (3): label + ícone à esquerda, contador mono à direita, barra altura 4 radius 99.
  - Quando cheia (uso == total): cor da barra/contador/ícone vira `accent` (sinaliza limite atingido).
  - Quando não cheia: barra `rgba(255,255,255,0.6)`, texto branco.
- CTAs: Primary "Fazer upgrade" (accent), Secondary "Pagamentos" (border `rgba(255,255,255,0.18)`).

## Card de link público

bg `surface`, border `line`, radius 14, padding 14.

```
┌────────────────────────────────────────┐
│ [⤴]  Sua página pública                │
│      Compartilhe pra clientes verem... │
│                                        │
│ ┌────────────────────────┬───────────┐ │
│ │ jregu.app/jregu-s      │ 📋 Copiar │ │
│ └────────────────────────┴───────────┘ │
│ [⤴ Compartilhar] [QR code] [↗ Abrir]   │
└────────────────────────────────────────┘
```

- Header: ícone share 28×28 bg `accentSoft` cor `accent` radius 8 + título 13/800 + subtítulo 11 muted.
- Input com URL: bg `surface2`, mono, "jregu.app/" em muted + slug em **accent 800**. Botão "Copiar" à direita, bg `ink` color branco.
- Ao copiar: botão vira `success` com ícone check e label "Copiado" por 1.6s.
- 3 botões abaixo (equally flex): border `line`, font 12px/700 muted, ícones share/qr/external.

## Card de agendamento automático (colapsável)

Header sempre visível:

- Ícone refresh num container 32×32 (bg `accentSoft` cor `accent` se ativo; senão bg `lineSoft` cor muted).
- Título "Agendamento automático" + subtítulo dinâmico:
  - Ativo: `● Ativo · 14 dias · 19:33 · a cada 15min` (verde + restantes)
  - Inativo: "Desativado · clique pra configurar"
- À direita: **toggle iOS** (40×24, bg `success` quando ativo) + chevron rotativo.

Conteúdo expandido (quando ativo + aberto):

- 3 campos `Field` (label uppercase 11 + valor mono): Antecedência (14 dias), Horário de criação diária (19:33, ícone clock), Verificação de cancelamento (A cada 15 min).

Conteúdo expandido (quando inativo): texto 12px muted explicando o que ativar faz.

## Card de info da empresa

Header com logo "JR" (48×48 radius 12 bg `accentSoft` cor `accent` 18px/800), nome **JRegu's**, slug mono `/jregu-s` muted, botão "Editar" pill à direita.

Lista `InfoRow` (ver components.md): CNPJ, E-mail, Telefone, Endereço, Status.

- Status formatado com ponto verde + "Ativa" (cor `success`, font 700).

## Grid 2×1 — veículo + motorista

2 cards iguais. Cada um:

- Top: ícone (car / users) + chevron (clicável)
- Número grande mono: 1
- Label muted: "Veículo cadastrado" / "Motorista ativo"

---

## Comportamento

- Toggle automação: anima toggle + revela/esconde corpo do card com animation.
- Botão Copiar: copia para clipboard, feedback visual 1.6s.
- Editar empresa, upgrade, pagamentos, QR, share → navegar para telas correspondentes (fora do escopo deste handoff).
