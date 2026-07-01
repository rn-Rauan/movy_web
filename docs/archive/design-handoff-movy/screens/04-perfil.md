# 04 · Perfil

**Propósito.** Conta pessoal do usuário (admin). Editar dados, ativar perfil de motorista, configurações de segurança.

**Arquivo fonte.** `source/screens.jsx` → `ScreenPerfil`.

---

## Estrutura (top → bottom)

1. **Top bar** — "Perfil".
2. **Header de perfil** (card branco com radial gradient atrás do avatar).
3. **Info block** — nome / e-mail (InfoRow2).
4. **CTA "Trabalhar como motorista"** (card com cor de fundo `accentSoft`).
5. **Bloco "Conta"** — 3 ações (alterar senha, notificações, privacidade).
6. **Botão Sair** (vermelho de borda).
7. **Versão** centralizada em mono.

Gap 14.

---

## Header de perfil

Card `surface`, border `line`, radius 18, padding 18, texto centralizado, overflow hidden.

Layer de fundo: `radial-gradient(60% 70% at 50% 0%, accentSoft 0%, transparent 70%)` opacidade 0.7 — dá um halo suave no topo.

Conteúdo (acima do gradient):

- **Avatar circular** 72×72 radius 99, bg `ink` color branco, "JR" 26px/800, border 3px `surface`, shadow `0 4px 16px ${accentSoft}`.
- Nome 20px / 800 / -0.5.
- E-mail 13px / 500 / muted.
- 2 botões pill abaixo: "Editar perfil" (primário escuro) + "Compartilhar" (ghost branco com border).

## Info block

Card `padding: 4`. Dentro, 2 `InfoRow2`:

- Cada row: container 32×32 radius 8 bg `surface2` com ícone (15px muted) + label uppercase 11 + valor 14/600
- Linha 1: ícone user, label "Nome", value "Jacintos Regus"
- Linha 2: ícone mail, label "E-mail", value "jacinto@email.com" (last)

## CTA "Trabalhar como motorista"

Card bg `accentSoft`, border `${accent}22`, radius 14, padding 16.

Layout horizontal:

- Container 38×38 radius 10 bg `accent` color `accentInk` com ícone id (18px)
- À direita: "Trabalhar como motorista" 14/800 + descrição 12px `ink2` lineheight 1.45

Botão full-width abaixo (margin-top 14): bg `ink` color branco, padding 12, radius 10, texto "Ativar perfil de motorista →" 13/700.

## Bloco "Conta"

Label "CONTA" (uppercase 11/700/muted/spacing 0.5) acima do card.

Card `padding: 4` com 3 `Action`:

1. ícone lock — "Alterar senha" — hint "Última alteração há 32 dias"
2. ícone bolt — "Notificações" — hint "Push, e-mail, SMS"
3. ícone alert — "Privacidade & dados" — hint "Exportar, excluir conta" (last)

Cada Action: container 32×32 + label 14/700 + hint 11/muted + chevron à direita.

## Botão Sair

Full width, bg `surface`, border `dangerSoft`, color `danger`, padding 14, radius 14, font 13/700.
Ícone logout 16 + label "Sair da conta".

## Versão

Texto centralizado abaixo:

- "v 2.4.1 · build 2026.05"
- mono 10px / muted
