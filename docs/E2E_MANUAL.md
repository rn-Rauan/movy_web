# Movy Web — Casos de Teste Manuais E2E

**Versão:** v1.0 (deploy MVP) · **Última atualização:** 2026-05-20

Bateria completa de cenários manuais para validar o frontend antes do deploy. Cobre auth, onboarding, marketplace, booking, perfil, todas as telas admin, driver self-service, e fluxos cruzados/edge cases.

---

## Pré-requisitos globais

- **Backend** Movy Java rodando em `VITE_API_URL` (padrão `http://localhost:5701`).
- **Frontend** rodando via `npm run dev`.
- **Dev tools de email**: tokens de reset/verify saem em `GET /dev/emails/latest?to=<email>` (em dev mode — `ConsoleEmailService` no backend). Em prod isso retorna vazio.
- **Seed mínimo** sugerido:
  - 1 organização ativa com plano FREE (1 veículo / 2 motoristas / 10 viagens/mês — fácil de estourar limites).
  - 1 organização com plano PREMIUM (≥1000 viagens/mês — pra validar "ilimitado").
  - 1 template recorrente com horários configurados.
  - 1+ viagens públicas SCHEDULED.
- **Contas sugeridas** (criar antes de começar):
  - `passenger@test.com` / senha forte — sem org
  - `admin@test.com` / senha forte — admin de uma org
  - `driver@test.com` / senha forte — driver vinculado à org do admin

## Convenções

| Marca | Significado                                                                          |
| ----- | ------------------------------------------------------------------------------------ |
| ✅    | Passou                                                                               |
| ❌    | Falhou — descrever na linha "Observações"                                            |
| ⚠️    | Passou parcialmente / comportamento estranho não-bloqueante                          |
| N/A   | Cenário não aplicável neste ambiente (ex: dev-only test rodando em homolog sem mock) |

Cada cenário tem **Pré-condições**, **Passos** numerados, **Resultado esperado** e área pra anotações.

---

## Índice

- [A. Autenticação](#a-autenticação)
- [B. Onboarding (setup)](#b-onboarding-setup)
- [C. Index routing e BottomNav](#c-index-routing-e-bottomnav)
- [D. Marketplace público](#d-marketplace-público)
- [E. Página pública de organização e planos](#e-página-pública-de-organização-e-planos)
- [F. Booking (passenger)](#f-booking-passenger)
- [G. Perfil de passageiro e ativação driver](#g-perfil-de-passageiro-e-ativação-driver)
- [H. Driver self-service](#h-driver-self-service)
- [I. Admin: dashboard e organization](#i-admin-dashboard-e-organization)
- [J. Admin: templates](#j-admin-templates)
- [K. Admin: trips](#k-admin-trips)
- [L. Admin: drivers](#l-admin-drivers)
- [M. Admin: vehicles](#m-admin-vehicles)
- [N. Admin: organization e plano](#n-admin-organization-e-plano)
- [O. Admin: payments](#o-admin-payments)
- [P. Driver: tela de viagem](#p-driver-tela-de-viagem)
- [Q. Edge cases e fluxos cruzados](#q-edge-cases-e-fluxos-cruzados)

---

## A. Autenticação

### #1 — Cadastro B2C (passageiro) — happy path

**Área:** Auth
**Pré-condições:** Deslogado, email novo (não cadastrado).

**Passos:**

1. Acessar `/`.
2. Clicar "Cadastre-se" → vai pra `/signup`.
3. Preencher nome, email novo, telefone, senha ≥8 chars.
4. Submeter.

**Resultado esperado:** Conta criada (`POST /auth/register` 201), tokens salvos em localStorage (`tt_access`, `tt_refresh`, `tt_user`), redirect pra `/public/trip-instances`, BottomNav de passenger visível.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #2 — Cadastro B2C com email já cadastrado

**Área:** Auth
**Pré-condições:** Email do passo já existe.

**Passos:**

1. `/signup` com email que já está cadastrado.

**Resultado esperado:** Toast de erro 409 amigável (ex.: "Email já cadastrado"); permanece no form com dados.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #3 — Cadastro B2C com senha curta

**Área:** Auth
**Pré-condições:** Deslogado.

**Passos:**

1. `/signup` com senha de 5 chars.
2. Submeter.

**Resultado esperado:** Validação Zod no FE bloqueia antes do request — mensagem "Senha deve ter ao menos 8 caracteres".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #4 — Cadastro B2B (empresa) — happy path

**Área:** Auth
**Pré-condições:** Deslogado, email + CNPJ + slug novos.

**Passos:**

1. `/` → "Sou empresa" / "Cadastre-se" → `/signup/empresa`.
2. Preencher todos os campos: user (nome, email, senha, telefone) + organização (nome, CNPJ, email, telefone, endereço, slug).
3. Submeter.

**Resultado esperado:** User + org criados atomicamente (`POST /auth/register-organization` 201), redirect pra dashboard admin, BottomNav de admin visível (Explorar / Viagens / Configurar).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #5 — Cross-flow: B2C criado → voltar → tentar B2B com mesmo email

**Área:** Cross-flow
**Pré-condições:** Cenário #1 concluído (conta B2C existe).

**Passos:**

1. Logout (se estiver logado).
2. Em `/signup/empresa`, preencher com **o mesmo email** do cenário #1, mas com CNPJ e slug novos.
3. Submeter.

**Resultado esperado:** Erro 409 ("usuário já existe"). Form não fecha, dados preservados. localStorage não muda (sem sessão ativa criada).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #6 — Cadastro B2B com CNPJ duplicado

**Área:** Auth
**Pré-condições:** CNPJ já usado em outra org.

**Passos:**

1. `/signup/empresa` com CNPJ duplicado.

**Resultado esperado:** Erro 409 amigável.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #7 — Cadastro B2B com slug duplicado

**Área:** Auth
**Pré-condições:** Slug `acme` já existe.

**Passos:**

1. `/signup/empresa` com `slug = acme`.

**Resultado esperado:** Erro 409 amigável referenciando o slug.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #8 — Login com credenciais corretas — redirect por role

**Área:** Auth
**Pré-condições:** Contas passenger e admin existem.

**Passos:**

1. `/login` com `passenger@test.com` → confirmar redirect pra `/public/trip-instances`.
2. Logout.
3. `/login` com `admin@test.com` → confirmar redirect pra `/dashboard`.

**Resultado esperado:** Redirect por role funciona; BottomNav corresponde.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #9 — Login com senha errada

**Área:** Auth
**Pré-condições:** Conta existe.

**Passos:**

1. `/login` com email correto + senha errada.

**Resultado esperado:** Toast "Credenciais inválidas" ou similar (401 mapeado). localStorage permanece vazio.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #10 — Login com email inexistente

**Área:** Auth
**Pré-condições:** Deslogado.

**Passos:**

1. `/login` com email aleatório que não existe.

**Resultado esperado:** Mesmo toast genérico do #9 (anti-enumeração). Sem revelar que email não existe.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #11 — Logout limpa sessão

**Área:** Auth
**Pré-condições:** Logado.

**Passos:**

1. No menu de perfil, clicar "Sair".
2. Abrir DevTools → Application → localStorage.

**Resultado esperado:** `tt_access`, `tt_refresh`, `tt_user` removidos. Redirect pra landing/login. Backend recebe `POST /auth/logout` com refreshToken (verificar Network).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #12 — Forgot password — fluxo completo

**Área:** Auth
**Pré-condições:** Conta `passenger@test.com` existe.

**Passos:**

1. `/login` → clicar "Esqueci a senha" → vai pra `/forgot-password`.
2. Submeter `passenger@test.com`.
3. Ver tela de confirmação genérica ("Se o email estiver cadastrado, você receberá um link").
4. Em outro tab, abrir `GET /dev/emails/latest?to=passenger@test.com` — copiar `metadata.token`.
5. Abrir `/reset-password?token=<token>`.
6. Submeter senha nova (≥8 chars) + confirmação igual.

**Resultado esperado:** Após reset, redirect pra `/`, sessão ativa (tokens novos no localStorage), pode navegar como passenger. Tentar logar com a senha antiga falha.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #13 — Forgot password com email não cadastrado

**Área:** Auth
**Pré-condições:** Deslogado.

**Passos:**

1. `/forgot-password` com email aleatório que não existe.

**Resultado esperado:** Mesma mensagem genérica do #12. Backend retorna 204 também. Nenhum email enviado.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #14 — Reset password — confirmação senha não bate

**Área:** Auth
**Pré-condições:** Token válido em mãos.

**Passos:**

1. `/reset-password?token=<token>` → digitar senhas diferentes nos dois campos.

**Resultado esperado:** Erro de validação Zod no campo "Confirmar senha" — request não é feito.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #15 — Reset password com token expirado/usado

**Área:** Auth
**Pré-condições:** Já usou um token (cenário #12) ou esperar >1h.

**Passos:**

1. Reabrir `/reset-password?token=<token-já-usado>`.
2. Submeter qualquer senha nova.

**Resultado esperado:** Toast "Link de recuperação expirou. Solicite outro." (mapeado de `INVALID_OR_EXPIRED_RESET_TOKEN_BAD_REQUEST`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #16 — Reset password sem token na URL

**Área:** Auth
**Pré-condições:** Deslogado.

**Passos:**

1. Acessar `/reset-password` (sem `?token=…`).

**Resultado esperado:** Página mostra estado de erro "Link de recuperação inválido" com CTA "Solicitar novo link" → `/forgot-password`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #17 — Verify email — fluxo válido

**Área:** Auth
**Pré-condições:** Conta nova com `emailVerifiedAt = null`. Token de verificação obtido via `GET /dev/emails/latest`.

**Passos:**

1. Abrir `/verify-email?token=<token>`.
2. Observar estado "Verificando...".
3. Aguardar redirect (1.5s) pra `/`.
4. Em DevTools, observar payload de `POST /auth/refresh` retornar `user.emailVerifiedAt` populado.

**Resultado esperado:** Toast "E-mail verificado!", redirect, JWT atualizado.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #18 — Verify email com token inválido/expirado

**Área:** Auth
**Pré-condições:** Token de verificação já usado ou >24h.

**Passos:**

1. Abrir `/verify-email?token=<token-inválido>`.

**Resultado esperado:** Mensagem "Link de verificação expirou ou já foi usado." (mapeado de `INVALID_OR_EXPIRED_VERIFICATION_TOKEN_BAD_REQUEST`). Botão "Voltar ao login" visível.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #19 — Verify email sem token

**Área:** Auth
**Pré-condições:** Deslogado.

**Passos:**

1. Acessar `/verify-email` (sem `?token=…`).

**Resultado esperado:** Mensagem "Link de verificação inválido" + CTA "Voltar ao login".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## B. Onboarding (setup)

### #20 — Setup completo (passenger → admin via wizard)

**Área:** Onboarding
**Pré-condições:** Conta passenger logada sem org.

**Passos:**

1. Acessar `/setup` (deep link).
2. **Passo 1:** Criar organização (nome, CNPJ novo, email, telefone, endereço, slug novo).
3. **Passo 2:** Criar template — horários BR (FE converte pra UTC), defaultCapacity ≥1.
4. **Passo 3:** Criar instância — `departureDate` (YYYY-MM-DD), capacidade.
5. **Passo 4:** Associar motorista (opcional — pular).
6. Concluir.

**Resultado esperado:** User vira admin da nova org. BottomNav passa a mostrar Explorar/Viagens/Configurar. Redirect `/organizations`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #21 — Setup: slug já existente no passo 1

**Área:** Onboarding
**Pré-condições:** Slug `acme` já existe.

**Passos:**

1. `/setup` passo 1 com slug `acme`.
2. Submeter.

**Resultado esperado:** Erro 409 com mensagem clara. Form preserva os outros campos pra correção.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #22 — Setup: admin com org tenta reentrar

**Área:** Onboarding
**Pré-condições:** Logado como admin com org existente.

**Passos:**

1. Acessar `/setup`.

**Resultado esperado:** Redirect imediato pra `/organizations` (não permite recriar org).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## C. Index routing e BottomNav

### #23 — Landing pra não-autenticado

**Área:** Routing
**Pré-condições:** Deslogado.

**Passos:**

1. Acessar `/`.

**Resultado esperado:** LandingPage visível com CTAs `/login`, `/signup`, `/signup/empresa`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #24 — Redirect inteligente por role

**Área:** Routing
**Pré-condições:** Contas passenger e admin existem.

**Passos:**

1. Logado como passenger, abrir `/` → redirect `/public/trip-instances`.
2. Logout. Logado como admin, abrir `/` → redirect `/dashboard`.
3. Logout. Logado como driver vinculado, abrir `/` → BottomNav mostra tab "Como motorista".

**Resultado esperado:** Cada role vê tabs corretas (precedência admin > driver > passenger).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #25 — BottomNav esconde "Como motorista" para user sem membership

**Área:** Routing
**Pré-condições:** User com `hasDriverProfile === true` mas **sem** membership DRIVER ativa.

**Passos:**

1. Logar como o user.
2. Inspecionar BottomNav.

**Resultado esperado:** Tab "Como motorista" **não** aparece. Tabs visíveis: **Explorar · Empresas · Inscrições · Perfil** (padrão passenger). O user só pode acessar `/profile/driver` via `/profile`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #25b — Driver com membership ativa vê 4 tabs

**Área:** Routing
**Pré-condições:** Driver com profile + membership ativa.

**Passos:**

1. Logar como driver.

**Resultado esperado:** BottomNav mostra **Explorar · Como motorista · Inscrições · Perfil** (4 tabs). Clicar em "Perfil" → `/profile` → card "Trabalhar como motorista" leva pra `/profile/driver`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## D. Marketplace público

### #26 — Listar viagens públicas (deslogado e logado)

**Área:** Marketplace
**Pré-condições:** ≥3 viagens públicas SCHEDULED.

**Passos:**

1. Deslogado, acessar `/public/trip-instances` — verificar listagem.
2. Logar como passenger, acessar mesma rota.

**Resultado esperado:** Mesma lista nas duas situações. Network mostra `GET /public/trip-instances` sem header `Authorization` quando deslogado.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #27 — Buscar e filtrar viagens

**Área:** Marketplace
**Pré-condições:** Marketplace com viagens em vários turnos/datas.

**Passos:**

1. Em `/public/trip-instances`, aplicar busca por texto, filtro de data, filtro de turno (manhã/tarde/noite), ordenação por preço.
2. Verificar URL ganha query params.
3. Copiar URL, abrir em aba anônima.

**Resultado esperado:** Filtros persistem entre navegações via URL — outro user vê mesma view.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #28 — Detalhe de viagem deslogado → login mantém destino

**Área:** Marketplace
**Pré-condições:** Deslogado.

**Passos:**

1. Abrir `/public/trip-instances/$id` de uma viagem.
2. Clicar "Entrar para reservar" — verificar URL vira `/login?redirect=…`.
3. Logar.

**Resultado esperado:** Após login, volta pra tela de detalhe (ou direto pro form de booking, dependendo do redirect).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #29 — Detalhe de viagem com user já inscrito

**Área:** Marketplace
**Pré-condições:** Passenger logado com 1 booking ACTIVE na viagem X.

**Passos:**

1. Acessar `/public/trip-instances/$X`.

**Resultado esperado:** Botão "Ver inscrição" → `/my-bookings/$bookingId` (não mostra "Inscrever-se").

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #30 — ShareButton (Web Share + clipboard fallback)

**Área:** Marketplace
**Pré-condições:** Viagem aberta em detalhe.

**Passos:**

1. **Mobile:** clicar ShareButton — sheet nativo de share aparece.
2. **Desktop:** clicar ShareButton — link copiado pro clipboard + toast de confirmação.

**Resultado esperado:** Em ambos casos, URL compartilhada é a do detalhe público.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## E. Página pública de organização e planos

### #31 — Perfil público de organização

**Área:** Marketplace
**Pré-condições:** Org com slug `acme` ativa, ≥1 viagem SCHEDULED.

**Passos:**

1. Acessar `/public/organizations/acme`.

**Resultado esperado:** Dados da org renderizados (nome, contato). Lista de viagens daquela org (todas, mesmo as `isPublic = false`). ShareButton funcional.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #32 — `/public/plans` é anônimo

**Área:** Planos
**Pré-condições:** Deslogado.

**Passos:**

1. Abrir DevTools → Network. Acessar `/public/plans`.

**Resultado esperado:** Lista carrega. Request `GET /public/plans` **sem** header `Authorization`. Plano premium (`maxMonthlyTrips ≥ 1000`) mostra **"Viagens ilimitadas por mês"** ao invés de número literal.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #33 — CTA de plano leva pra signup empresa

**Área:** Planos

**Passos:**

1. Em `/public/plans`, clicar "Começar com [plano]".

**Resultado esperado:** Redirect pra `/signup/empresa`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## F. Booking (passenger)

### #34 — Reservar viagem disponível

**Área:** Booking
**Pré-condições:** Passenger logado, viagem com vagas (`availableSlots > 0`).

**Passos:**

1. `/public/trip-instances/$id` → "Inscrever-se" → `/trips/$orgId/$tripId/book`.
2. Selecionar parada de embarque e desembarque (diferentes) via `<Select>`.
3. Escolher tipo: Ida / Volta / Ida e volta.
4. Escolher método: Dinheiro / PIX / Cartão.
5. Submeter.

**Resultado esperado:** Booking criado. Redirect `/bookings-success/$bookingId` com confetti. Status localStorage não muda.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #35 — Mesma parada embarque/desembarque

**Área:** Booking
**Pré-condições:** Form de booking aberto.

**Passos:**

1. Selecionar mesma parada nos dois `<Select>`.

**Resultado esperado:** Segundo Select desabilita a parada já escolhida no primeiro (ou validação no submit impede).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #36 — Reservar viagem lotada

**Área:** Booking
**Pré-condições:** Viagem com `availableSlots = 0`.

**Passos:**

1. Tentar reservar.

**Resultado esperado:** Botão "Inscrever-se" disabled ou backend rejeita com mensagem clara.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #37 — Cancelar inscrição dentro da janela

**Área:** Booking
**Pré-condições:** Booking ACTIVE em viagem com partida >30min no futuro.

**Passos:**

1. `/my-bookings/$bookingId` → "Cancelar inscrição" → AlertDialog confirma → cancela.

**Resultado esperado:** Status vira INACTIVE. Vaga libera (verificar em outra aba como admin).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #38 — Cancelar < 30min antes da partida

**Área:** Booking
**Pré-condições:** Booking em viagem com partida em ≤25min (manipular via admin pra simular).

**Passos:**

1. Tentar cancelar.

**Resultado esperado:** Toast "Cancelamento bloqueado: faltam menos de 30 minutos para a partida." (`BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #39 — Cancelar booking de viagem `IN_PROGRESS`

**Área:** Booking
**Pré-condições:** Admin põe trip em IN_PROGRESS; passenger tem booking ACTIVE nela.

**Passos:**

1. Passenger tenta cancelar.

**Resultado esperado:** Toast "Esta viagem já começou — inscrições não podem mais ser canceladas." (`BOOKING_TRIP_TERMINAL_BAD_REQUEST`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #40 — Lista de minhas inscrições + filtro

**Área:** Booking
**Pré-condições:** Passenger com bookings ACTIVE e INACTIVE.

**Passos:**

1. `/my-bookings`. Aplicar busca e filtro por status.

**Resultado esperado:** Lista filtra corretamente.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## G. Perfil de passageiro e ativação driver

### #41 — Editar perfil + trocar senha

**Área:** Profile
**Pré-condições:** Logado.

**Passos:**

1. `/profile` → editar nome, telefone, email. Salvar.
2. Trocar senha (campo separado). Salvar.
3. Logout + login com senha nova.

**Resultado esperado:** Mudanças persistem. Senha antiga não funciona mais.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #42 — Card "Trabalhar como motorista" → `/profile/driver`

**Área:** Profile
**Pré-condições:** Passenger sem driver profile.

**Passos:**

1. `/profile` → ver card "Trabalhar como motorista" → clicar.

**Resultado esperado:** Vai pra `/profile/driver` em modo create (alert amarelo + checkbox obrigatório).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #43 — Ativar perfil de driver (múltiplas categorias)

**Área:** Profile
**Pré-condições:** `/profile/driver` em modo create.

**Passos:**

1. Marcar categorias A + B + D no checkbox group.
2. Informar CNH (9–12 dígitos) e validade futura.
3. Marcar checkbox de confirmação obrigatória.
4. Submeter.

**Resultado esperado:** Perfil criado (`POST /drivers`) com `cnhCategories: ["A","B","D"]`. Card volta como "Aguardando vínculo com uma empresa". BottomNav **não** muda (ainda não é driver completo).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #44 — Botão "Ativar" disabled sem checkbox

**Área:** Profile
**Pré-condições:** Modo create, dados todos preenchidos.

**Passos:**

1. Não marcar o checkbox de confirmação.

**Resultado esperado:** Botão "Ativar perfil" disabled.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## H. Driver self-service

### #45 — Editar driver via PATCH /drivers/me

**Área:** Driver
**Pré-condições:** User com driver profile já criado.

**Passos:**

1. `/profile/driver` — ver Card "Seus dados" em **modo read-only** (CNH, categorias como Badges, validade) com botão pencil no header.
2. Clicar pencil → **Dialog "Editar dados do motorista"** abre com o form pré-preenchido.
3. Verificar que input `CNH` no Dialog está readonly + mensagem "Para trocar o número da CNH, fale com um administrador".
4. Trocar categorias (adicionar D em quem tinha A+B).
5. Trocar `cnhExpiresAt` pra data futura.
6. Salvar.

**Resultado esperado:** Request `PATCH /drivers/me` envia só os 2 campos (NÃO o cnh). Dialog fecha + toast "Dados atualizados" + Card mostra novos valores. **NÃO** deve haver flicker pra LoadingList depois do salvar.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #45b — Editar só categorias mesmo com CNH vencida

**Área:** Driver · Edge
**Pré-condições:** User com driver profile cuja `cnhExpiresAt` está no passado.

**Passos:**

1. Abrir Dialog de edição (#45 passos 1–2).
2. Trocar só as categorias. **Não tocar no campo de validade.**
3. Salvar.

**Resultado esperado:** Sucesso. Schema `makeDriverSchema` percebe que data não mudou vs initial → não exige futuro → PATCH passa.

**Caso oposto:** Trocar a validade pra outra data passada (ex.: `2025-06-01`) → Zod bloqueia com "Validade deve ser uma data futura".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #46 — Admin vincula driver → user vira driver

**Área:** Driver
**Pré-condições:** User com profile (#43) + admin de uma org.

**Passos:**

1. Admin em `/drivers` → adicionar driver via email + CNH.
2. User faz logout/login (ou aguarda refresh de role).
3. Inspecionar BottomNav.

**Resultado esperado:** Tab "Como motorista" agora aparece. `/my-trips` é acessível.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #47 — `/my-trips` lista viagens atribuídas

**Área:** Driver
**Pré-condições:** Driver com 2 viagens atribuídas (em SCHEDULED ou CONFIRMED).

**Passos:**

1. Acessar `/my-trips`.

**Resultado esperado:** Lista mostra TripCards das viagens; cada card linka pra `/trip/$tripId`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #48 — `/my-trips` vazio

**Área:** Driver
**Pré-condições:** Driver sem viagens atribuídas (ou perfil INACTIVE).

**Passos:**

1. Acessar `/my-trips`.

**Resultado esperado:** EmptyState "Nenhuma viagem atribuída" — não erro nem 403. Mesma resposta se perfil for INACTIVE/SUSPENDED.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## I. Admin: dashboard e organization

### #49 — Dashboard métricas + próximas viagens

**Área:** Admin
**Pré-condições:** Admin logado, org com viagens nos próximos 7 dias.

**Passos:**

1. `/dashboard`.

**Resultado esperado:** Métricas (ativas / próximos 7 dias / passageiros / ocupação%) + card de receita prevista + lista de próximas viagens. Clicar em viagem → `/trip/$tripId`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #50 — Organization editar dados

**Área:** Admin
**Pré-condições:** Admin logado.

**Passos:**

1. `/organization` → editar nome, telefone, endereço.
2. Salvar.

**Resultado esperado:** Mudanças persistem.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #51 — Card de uso vs limite (plano FREE)

**Área:** Admin
**Pré-condições:** Org em plano FREE (limites baixos).

**Passos:**

1. `/organization`.

**Resultado esperado:** 3 barras: Veículos, Motoristas, Viagens este mês. Cada uma com "X / Y". Barra fica vermelha quando used = max.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #52 — Card de uso em plano premium ("ilimitado")

**Área:** Admin
**Pré-condições:** Org em plano com `maxMonthlyTrips ≥ 1000` (limiar de `isUnlimitedPlanLimit` em `lib/format.ts`).

**Passos:**

1. `/organization`.

**Resultado esperado:** Linha "Viagens este mês" mostra `X (ilimitado)` SEM barra de progresso, sem cor vermelha por estouro. Em `/public/plans`, mesmo plano aparece como "Viagens ilimitadas por mês" (ao invés de "Até 9999 viagens"). No `UpgradePlanDialog`, subtítulo do plano mostra "viagens ilimitadas/mês".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #53 — SchedulingConfigCard

**Área:** Admin
**Pré-condições:** Admin em `/organization`.

**Passos:**

1. Localizar SchedulingConfigCard.
2. Togglear `enabled`.
3. Ajustar `daysAhead` (1–90).
4. Mudar horário de geração (BR — verificar que FE manda cron em UTC).
5. Trocar frequência de auto-cancel via Select de presets.

**Resultado esperado:** Cada mudança dispara `PATCH /scheduling-config` parcial. Cron string crua NUNCA é exposta na UI.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## J. Admin: templates

### #54 — Criar template recorrente completo

**Área:** Admin
**Pré-condições:** Admin logado.

**Passos:**

1. `/templates` → "Novo template".
2. Preencher origem, destino, paradas (≥2), turno, horários BR, capacidade (≥1).
3. Marcar "Recorrente" → escolher dias da semana.
4. Adicionar pelo menos 1 preço.
5. Salvar.

**Resultado esperado:** Template criado. Network mostra `departureTimeOfDay`/`arrivalTimeOfDay` em UTC (não BR).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #55 — Template com defaultDriver + defaultVehicle (Auto-publica)

**Área:** Admin
**Pré-condições:** Org tem ≥1 driver ACTIVE e ≥1 vehicle ACTIVE.

**Passos:**

1. Criar/editar template — selecionar driver e veículo padrão.
2. Salvar.
3. Verificar `TemplateCard` mostra badge **"Auto-publica"**.
4. Botão "Gerar instâncias" → confirmar.

**Resultado esperado:** Toast `{ created, skipped, failed }`. Instâncias geradas têm `tripStatus = "SCHEDULED"` (já visíveis no marketplace público).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #56 — Template sem defaults → instâncias geradas como DRAFT

**Área:** Admin
**Pré-condições:** Template sem defaultDriverId/defaultVehicleId.

**Passos:**

1. Gerar instâncias.

**Resultado esperado:** Instâncias em DRAFT. Em `/trips`, admin precisa atribuir driver+vehicle e transitionar manualmente.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #57 — Limpar defaults

**Área:** Admin
**Pré-condições:** Template com ambos defaults (#55).

**Passos:**

1. Editar template → no Select de driver/vehicle, escolher "Nenhum".
2. Salvar.
3. Verificar badge "Auto-publica" sumiu.

**Resultado esperado:** PUT envia `defaultDriverId: null` e `defaultVehicleId: null`. Próxima geração cria DRAFT.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #58 — Gerar instâncias em template não-recorrente

**Área:** Admin
**Pré-condições:** Template com `isRecurring = false`.

**Passos:**

1. Em `TemplateCard`, botão "Gerar" não aparece (ou tentar via endpoint direto se for testar backend).

**Resultado esperado:** Botão `<CalendarPlus>` só renderiza pra `isRecurring && status === "ACTIVE"`. Se forçar, backend retorna `TRIP_TEMPLATE_NOT_RECURRING_BAD_REQUEST` mapeado.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## K. Admin: trips

### #59 — Listar e filtrar viagens

**Área:** Admin
**Pré-condições:** Org com viagens em vários status.

**Passos:**

1. `/trips` → aplicar filtro por status (DRAFT, SCHEDULED, IN_PROGRESS, etc.).

**Resultado esperado:** Lista filtra; ordenação por data correta.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #60 — Criar instância manualmente (departureDate, não departureTime)

**Área:** Admin
**Pré-condições:** Template com horários configurados.

**Passos:**

1. Em `/trips`, criar nova instância: selecionar template, informar `departureDate` (YYYY-MM-DD), capacidade.
2. Submeter.
3. Inspecionar Network: body deve ter `departureDate` mas NÃO `departureTime` nem `arrivalEstimate`.

**Resultado esperado:** Backend combina com time-of-day do template e devolve `departureTime`/`arrivalEstimate` na resposta.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #61 — Transição DRAFT → SCHEDULED requer driver+vehicle

**Área:** Admin
**Pré-condições:** Viagem DRAFT sem driver.

**Passos:**

1. `/trip/$tripId` → tentar transicionar pra SCHEDULED sem atribuir driver/vehicle.

**Resultado esperado:** Erro `TRIP_INSTANCE_REQUIRED_FIELD_BAD_REQUEST`. Atribuir os 2 → transição funciona.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #62 — Cancelar viagem com passageiros

**Área:** Admin
**Pré-condições:** Viagem SCHEDULED com bookings ACTIVE.

**Passos:**

1. `/trip/$tripId` → "Cancelar viagem" → AlertDialog confirma.

**Resultado esperado:** Status vira CANCELED. Redirect pra `/trips`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #63 — Atingir limite mensal de viagens (FREE plan)

**Área:** Admin · Limites de plano
**Pré-condições:** Org FREE (10 trips/mês). Já criou 9 nesse mês.

**Passos:**

1. Criar a 10ª — sucesso.
2. Criar a 11ª.

**Resultado esperado:** Na 11ª, toast "Você atingiu o limite do seu plano" com action "Ver planos" → `/organization`. (`MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## L. Admin: drivers

### #64 — Adicionar driver via lookup

**Área:** Admin
**Pré-condições:** User externo já criou driver profile via `/profile/driver`. Admin tem email + CNH dele.

**Passos:**

1. `/drivers` → "Adicionar" → preencher email + CNH.
2. Submeter.

**Resultado esperado:** `POST /memberships/driver` com sucesso. Driver aparece na lista.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #65 — Adicionar driver com CNH que não bate

**Área:** Admin
**Pré-condições:** Admin sabe email correto mas digita CNH errada.

**Passos:**

1. Submeter form com CNH errada.

**Resultado esperado:** Erro 400 amigável ("CNH não confere com o email"). Driver **não** é vinculado.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #66 — Admin NÃO edita dados de driver (regra de UX)

**Área:** Admin · Política
**Pré-condições:** Admin logado em `/drivers`.

**Passos:**

1. Localizar card de qualquer driver.

**Resultado esperado:** `DriverCard` mostra Badge de status + botão de **remover** (UserX vermelho). **NÃO** existe botão pencil de editar. Decisão de UX: admin não muda CNH/categorias/validade/status global (preserva integridade cross-org). Pra mudar dados, o próprio driver edita via `/profile/driver` (PATCH /drivers/me).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #67 — Admin remove driver (soft, reversível)

**Área:** Admin
**Pré-condições:** Driver ativo na org.

**Passos:**

1. `/drivers` → clicar botão de remover no card → AlertDialog confirmar.
2. Inspecionar Network.

**Resultado esperado:** Request `DELETE /memberships/{userId}/{roleId}/{orgId}` retorna `boolean`. Card some da lista. Driver pode ser re-adicionado depois via "Adicionar motorista" (mesma rota `POST /memberships/driver`) — soft-remove é reversível.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #68 — Atingir limite de drivers do plano

**Área:** Admin · Limites
**Pré-condições:** Plano FREE = 2 drivers. Já tem 2.

**Passos:**

1. Tentar adicionar o 3º.

**Resultado esperado:** Toast de limite + action "Ver planos".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #69 — Card de driver mostra múltiplas categorias

**Área:** Admin
**Pré-condições:** Driver com `cnhCategories = ["A","B","D"]`.

**Passos:**

1. `/drivers`.

**Resultado esperado:** Card mostra "Cat. A, B, D" (não só uma letra). Nome do driver renderizado via `DriverDisplayName` (busca `/drivers/{id}/name` em background se `userName`/`userEmail` não vierem no payload).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #69b — Select de motorista mostra nome (não CNH)

**Área:** Admin
**Pré-condições:** Admin tem ≥1 driver ACTIVE; abrir form de template OU detalhe de trip com Select de "Motorista".

**Passos:**

1. Em `/templates` → criar/editar template → abrir Select de "Motorista padrão".
2. Em `/trip/$tripId` (admin) → abrir Select de "Motorista".

**Resultado esperado:** Cada opção mostra **nome do motorista** como label principal (não "CNH 12345..."). Linha secundária mostra CNH + categorias. `DriverDisplayName` resolve via cache global de `useDriverName` — primeiras vezes pode mostrar "Carregando..." brevemente, depois fica em cache.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## M. Admin: vehicles

### #70 — Criar veículo (placa antiga e Mercosul)

**Área:** Admin

**Passos:**

1. `/vehicles` → criar com placa `ABC1234`.
2. Criar outro com placa `ABC1D23`.

**Resultado esperado:** Ambas aceitas.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #71 — Desativar veículo remove de opções

**Área:** Admin
**Pré-condições:** Vehicle X ativo.

**Passos:**

1. Desativar X em `/vehicles`.
2. Abrir form de template (Phase 2.1) ou trip — Select de "Veículo padrão" / "Veículo".

**Resultado esperado:** X não aparece mais (filtra `status === "ACTIVE"`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #72 — Atingir limite de veículos

**Área:** Admin · Limites
**Pré-condições:** Plano FREE = 1 vehicle. Já tem 1.

**Passos:**

1. Tentar criar o 2º.

**Resultado esperado:** Toast de limite + action.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## N. Admin: organization e plano

### #73 — Trocar plano (UpgradePlanDialog)

**Área:** Admin · Plano
**Pré-condições:** Subscription ACTIVE em plano FREE.

**Passos:**

1. `/organization` → "Trocar de plano" → escolher PREMIUM no radio.
2. Confirmar.

**Resultado esperado:** `PATCH /subscriptions/{id}` com `{ planId: <premium> }`. Card atualizado. Limites novos aplicam imediatamente. Mesmo `subscription.id` mantido (verificar via DevTools).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #74 — Plano premium mostra "viagens ilimitadas/mês" no dialog

**Área:** Admin · Plano
**Pré-condições:** Plano com `maxMonthlyTrips ≥ 1000` ativo no backend.

**Passos:**

1. Abrir UpgradePlanDialog → radio do premium.

**Resultado esperado:** Texto: "R$ X/mês · N veículos · M motoristas · **viagens ilimitadas/mês**".

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## O. Admin: payments

### #75 — Listar pagamentos paginados

**Área:** Admin
**Pré-condições:** Org com ≥25 pagamentos.

**Passos:**

1. `/payments` → ver primeira página.
2. Navegar pra próxima.

**Resultado esperado:** Paginação funcional. Cada item mostra método, valor, status, data.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## P. Driver: tela de viagem

### #76 — Driver acessa `/trip/$id` de viagem própria

**Área:** Driver
**Pré-condições:** Driver com viagem X atribuída em status SCHEDULED.

**Passos:**

1. `/my-trips` → clicar na viagem X.
2. Inspecionar tela `/trip/$tripId`.

**Resultado esperado:**

- Detalhe da viagem visível.
- **Sem** Selects de "Motorista" e "Veículo" (assignment é admin-only).
- **Sem** botão "Cancelar viagem".
- Lista de passageiros visível.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #77 — Driver inicia viagem (SCHEDULED → IN_PROGRESS)

**Área:** Driver
**Pré-condições:** Driver na tela da viagem em SCHEDULED.

**Passos:**

1. Clicar "Iniciar viagem".

**Resultado esperado:** `PATCH /trip-instances/{id}/status { newStatus: "IN_PROGRESS" }` sucesso. Status atualiza na UI.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #78 — Driver finaliza viagem (IN_PROGRESS → FINISHED)

**Área:** Driver
**Pré-condições:** Viagem IN_PROGRESS atribuída ao driver.

**Passos:**

1. Clicar "Finalizar".

**Resultado esperado:** Status FINISHED. Botões de ação somem.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #79 — Driver tenta transição não permitida

**Área:** Driver
**Pré-condições:** Viagem SCHEDULED.

**Passos:**

1. (Se UI permitisse) tentar transicionar pra CONFIRMED ou CANCELED.

**Resultado esperado:** Botões dessas transições **não** estão visíveis pra driver (filtro `DRIVER_ALLOWED_TRANSITIONS`). Se tentar via API direto, backend retorna `DRIVER_TRIP_STATUS_TRANSITION_FORBIDDEN` com mensagem mapeada.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #80 — Driver tenta acessar trip não atribuída

**Área:** Driver
**Pré-condições:** Viagem Y existe mas NÃO está atribuída ao driver.

**Passos:**

1. Driver navega direto pra `/trip/$Y` via URL.

**Resultado esperado:** Backend retorna `TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN`. Toast "Você só pode atualizar viagens atribuídas a você". (Idealmente, tela mostra erro em vez de quebrar.)

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #81 — Driver INACTIVE não pode iniciar viagem

**Área:** Driver
**Pré-condições:** Admin põe perfil de driver como INACTIVE/SUSPENDED. Driver continua logado.

**Passos:**

1. Driver tenta clicar "Iniciar viagem".

**Resultado esperado:** Mesma mensagem do #80 (backend não diferencia pra não vazar estado).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## Q. Edge cases e fluxos cruzados

### #82 — Token de acesso expira → refresh transparente

**Área:** Auth · Edge
**Pré-condições:** Logado.

**Passos:**

1. DevTools → Application → localStorage → apagar manualmente `tt_access` (deixar `tt_refresh` intacto).
2. Disparar qualquer ação que faça request (ex.: recarregar `/my-bookings`).

**Resultado esperado:** Primeira chamada cai em 401 → `api.ts` invoca `doRefresh()` → retorna novo `tt_access` → request original é repetido → sucesso transparente pro user.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #83 — Refresh token também expirou

**Área:** Auth · Edge
**Pré-condições:** Logado.

**Passos:**

1. DevTools → apagar `tt_access` E `tt_refresh`.
2. Fazer qualquer ação autenticada.

**Resultado esperado:** Refresh falha → `tokenStorage.clear()` → erro "Sessão expirada. Faça login novamente." → redirect manual pra `/login` (verificar comportamento).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #84 — Logout em outra aba afeta esta

**Área:** Auth · Edge
**Pré-condições:** 2 abas abertas, ambas logadas como mesmo user.

**Passos:**

1. Tab A: navegar normalmente.
2. Tab B: logout.
3. Tab A: tentar qualquer ação autenticada.

**Resultado esperado:** Tab A perde sessão (refresh token foi revogado server-side). Próxima chamada cai em 401, refresh falha, redirect login. (Pode demorar 1 click — não há sync entre tabs).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #85 — Login em outra aba sobrescreve

**Área:** Auth · Edge
**Pré-condições:** 2 abas abertas. Tab A logada como user X.

**Passos:**

1. Tab B: login como user Y (outra conta).
2. Tab A: tentar uma ação.

**Resultado esperado:** Tokens da tab B sobrescreveram localStorage. Tab A faz request com token de Y — possível confusão de identidade até próxima reload. Documentar como conhecida (não é necessariamente bug).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #86 — Acessar rota protegida deslogado

**Área:** Routing · Guard

**Passos:**

1. Deslogado, abrir `/dashboard` direto.

**Resultado esperado:** `_protected.tsx` guard redireciona pra `/login?redirect=/dashboard`. Após login, volta pra `/dashboard`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #87 — Passenger tenta acessar `/dashboard`

**Área:** Routing · Guard
**Pré-condições:** Passenger logado.

**Passos:**

1. Acessar `/dashboard` via URL.

**Resultado esperado:** `_admin.tsx` guard redireciona pra `/`. Sem toast (silent redirect).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #88 — User sem driver tenta `/my-trips`

**Área:** Routing · Guard
**Pré-condições:** Passenger sem driver profile.

**Passos:**

1. Acessar `/my-trips` via URL.

**Resultado esperado:** `_driver.tsx` guard redireciona pra `/`.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #89 — Admin acessa `/trip/$id` da própria org

**Área:** Routing · Cross-role
**Pré-condições:** Admin logado.

**Passos:**

1. `/trips` → clicar numa viagem → `/trip/$id`.

**Resultado esperado:** Mesma rota unificada (anteriormente `/_admin/trip/$id`) renderiza com `role="admin"` — todos os Selects e botões disponíveis.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #90 — Compartilhar URL com filtros aplicados

**Área:** Marketplace · Cross-flow

**Passos:**

1. Passenger em `/public/trip-instances` aplica filtro de data + turno.
2. Copia URL.
3. Cola em aba anônima.

**Resultado esperado:** Aba anônima abre com os mesmos filtros aplicados (query params hidratam estado).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #91 — Backend offline durante uma ação

**Área:** Network · Edge
**Pré-condições:** Logado.

**Passos:**

1. DevTools → Network → throttle "Offline".
2. Tentar qualquer ação (ex.: criar booking).

**Resultado esperado:** Toast de erro de rede. App não trava. Reabilitar rede + retry funciona.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #92 — Trocar de role enquanto está numa rota

**Área:** Cross-flow
**Pré-condições:** Admin logado, em `/trips`. Cenário hipotético: outro admin remove sua membership.

**Passos:**

1. Outra sessão: remove membership do user.
2. Sessão original: navegar.

**Resultado esperado:** `useRole()` re-fetch (próxima nav). Tabs ajustam. Acesso a rotas admin redireciona. (Mais raro — documentar como observação se aplicar.)

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #93 — Geração de instâncias estoura limite no meio do sweep

**Área:** Admin · Edge
**Pré-condições:** Template recorrente com 14 dias programados, mas plano permite só mais 3 trips este mês.

**Passos:**

1. Clicar "Gerar instâncias agora".

**Resultado esperado:** Toast `{ created: 3, skipped: ?, failed: N }` — backend tenta gerar, falha graciosamente nas que estouram quota. Sweep não aborta no primeiro erro.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #94 — Sem subscription ativa em ação que precisa

**Área:** Admin · Plano · Edge
**Pré-condições:** Admin de org sem subscription ativa (ex: cancelada e já passou `expiresAt`).

**Passos:**

1. Tentar criar viagem / driver / vehicle.

**Resultado esperado:** Toast "Você atingiu o limite do seu plano" + action "Ver planos" → `/organization` (`NO_ACTIVE_SUBSCRIPTION_FORBIDDEN`).

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #95 — Acessar perfil de org com slug inválido

**Área:** Marketplace · Edge

**Passos:**

1. Abrir `/public/organizations/nao-existe`.

**Resultado esperado:** 404 backend → tela de erro / EmptyState ao invés de crash.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #96 — Detalhe de viagem que não é mais bookable

**Área:** Marketplace · Edge
**Pré-condições:** Viagem em FINISHED ou CANCELED.

**Passos:**

1. Abrir `/public/trip-instances/$id` dessa viagem.

**Resultado esperado:** Backend retorna 404 (só lista SCHEDULED/CONFIRMED). FE mostra mensagem "Viagem não disponível" sem crash.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

### #97 — Geração automática (cron) — observação passiva

**Área:** Scheduling · Backend
**Pré-condições:** SchedulingConfig com `enabled = true`, `generationCron = "0 2 * * *"`.

**Passos:**

1. Aguardar 02:00 UTC do dia seguinte (ou ajustar cron pra rodar em 1 minuto via SchedulingConfigCard).
2. Verificar `/trips` na manhã seguinte.

**Resultado esperado:** Instâncias dos templates recorrentes geradas automaticamente. Templates com defaults → SCHEDULED; sem → DRAFT.

**Status:** [ ] Passou [ ] Falhou
**Observações:**

---

## Apêndice: checklist rápido pré-deploy

Caso queira só um smoke test mínimo de 15min antes de subir:

- [ ] #1 Cadastro B2C
- [ ] #4 Cadastro B2B
- [ ] #8 Login por role
- [ ] #12 Forgot/reset password completo
- [ ] #17 Verify email
- [ ] #32 `/public/plans` anônimo + premium "ilimitado"
- [ ] #34 Reservar viagem
- [ ] #43 Ativar driver
- [ ] #45 PATCH /drivers/me
- [ ] #47 `/my-trips`
- [ ] #55 Template auto-publica
- [ ] #60 Criar trip via `departureDate`
- [ ] #73 Trocar plano
- [ ] #77 Driver inicia viagem
- [ ] #82 Refresh transparente

Se todos esses 15 passarem ✅, o deploy v1.0 está em forma. Bugs nos demais cenários podem virar tickets pós-deploy.
