# Decisions — Registro de decisões técnicas

> ADRs leves. Uma entrada por decisão relevante. Cada ADR tem: contexto, decisão, consequências, e quando reabrir.

**Formato:**

```
## ADR-NNN — Título curto
- Status: Aceito | Pendente | Reaberto | Substituído por ADR-XXX
- Data: YYYY-MM-DD
- Contexto: por que estamos decidindo isto agora
- Decisão: o que vai ser feito
- Consequências: o que isso implica (positivo e negativo)
- Reabrir quando: gatilho concreto que indica que a decisão precisa ser revisitada
```

---

## ADR-001 — MVP suporta apenas 1 organização por admin

- **Status:** Aceito
- **Data:** 2026-05-03
- **Contexto:** `RoleContext` (`src/lib/role-context.tsx`) atualmente faz `orgs.data[0]` ao detectar a organização do admin, ignorando organizações adicionais. Implementar seleção de organização (UI de troca, persistência da org "ativa", invalidar caches ao trocar) é trabalho não-trivial e não é necessário pra validar o produto.
- **Decisão:** Aceitar conscientemente que admin de múltiplas orgs vai ver apenas a primeira (`orgs[0]`) durante o MVP. Não adicionar UI de troca de organização nas Fases 1 e 2.
- **Consequências:**
  - **+** Reduz complexidade de toda tela admin (sem necessidade de "qual org estou vendo agora?").
  - **+** Permite focar em fechar o loop operacional primeiro.
  - **−** Admin de 2+ orgs precisa fazer logout/login com contas diferentes (workaround manual).
  - **−** Quando implementarmos, será necessário invalidar caches de listas dependentes de `adminOrgId` ao trocar — facilitado se já tivermos React Query (ver ADR-002).
- **Reabrir quando:** chegarmos à Fase 3 do roadmap, OU um cliente real solicitar gerenciar 2+ orgs.

---

## ADR-002 — React Query: instalado mas não adotado ainda

- **Status:** Pendente
- **Data:** 2026-05-03
- **Contexto:** `@tanstack/react-query@5.83` está em `package.json` mas nenhum hook usa. Hoje o padrão é Context + `useState/useEffect` em features de passenger, e fetching imperativo direto em rotas de admin. CLAUDE.md dizia "não adicionar React Query ainda" — ficou desatualizado.
- **Decisão:** Adotar React Query gradualmente a partir da Fase 2, começando por uma rota piloto (sugestão: `/_admin/trips` — alta visibilidade e sofre de stale data). Não migrar tudo de uma vez.
- **Consequências:**
  - **+** Cache compartilhado entre listas e detalhes (ex: editar viagem invalida lista).
  - **+** Eliminação de boilerplate `useState + useEffect + try/catch`.
  - **+** Facilita ADR-001 quando reaberto (basta invalidar tudo ao trocar de org).
  - **−** Padrão dual durante a migração (gerenciável se mantermos disciplina).
- **Reabrir quando:** começar a Fase 2.

---

## ADR-003 — Sem framework de testes (até a Fase 4)

- **Status:** Pendente
- **Data:** 2026-05-03
- **Contexto:** Nenhum teste configurado. Time é solo. CI roda apenas format + lint + build.
- **Decisão:** Não adotar framework de testes até a Fase 4 (Comercial). Antes de habilitar pagamento real, definir e configurar testes (Vitest + Testing Library, provavelmente) cobrindo no mínimo: services, hooks de feature, fluxo de booking.
- **Consequências:**
  - **+** Velocidade de iteração no MVP.
  - **−** Regressões silenciosas. Mitigar com smoke test manual antes de cada deploy.
  - **−** Refactor pra React Query (ADR-002) será mais arriscado sem testes — aceito.
- **Reabrir quando:** começar a Fase 4, OU surgir um bug recorrente que indica falta de cobertura.

---

## ADR-004 — Tokens em localStorage (aceito no MVP)

- **Status:** Aceito
- **Data:** 2026-05-03
- **Contexto:** `tokenStorage` (`src/lib/api.ts`) guarda `accessToken`, `refreshToken` e `user` em `localStorage`. Vetor de XSS conhecido — qualquer script injetado lê tokens.
- **Decisão:** Aceitar no MVP. Mitigado parcialmente porque o app não tem (ainda) injeção de HTML de terceiros nem rich-text editors.
- **Consequências:**
  - **+** Zero complexidade de cookies httpOnly + CSRF.
  - **−** Risco de XSS é alto se introduzirmos qualquer renderização de conteúdo de usuário sem sanitização.
- **Reabrir quando:** Fase 4 (antes de produção comercial), OU adicionarmos qualquer feature que renderize HTML/markdown de usuário (ex: descrição de organização rica, comentários).

---

## ADR-005 — Padrão dual de fetching (passenger vs. admin)

- **Status:** Pendente (será resolvido em Fase 2)
- **Data:** 2026-05-03
- **Contexto:** Rotas passenger seguem o padrão "feature hooks" descrito em `CLAUDE.md` (`useTrips`, `useBookings`, etc.). Rotas admin foram escritas com `useState + useEffect + service.then()` direto, criando inconsistência.
- **Decisão:** Decidir o padrão único na Fase 2, junto com ADR-002 (React Query). Provavelmente: feature hooks por cima de React Query.
- **Consequências:**
  - **+** Aceitar o dual hoje permite que features novas (Fase 1 driver) sigam o padrão correto sem refactor preemptivo.
  - **−** Quem mexer em rota admin hoje vai copiar o padrão errado. Mitigar lembrando-se ao revisar.
- **Reabrir quando:** ao começar Fase 2.

---

## Como adicionar uma nova ADR

1. Crie a próxima `ADR-NNN` no final, mantendo numeração contínua.
2. Status inicial geralmente é `Aceito` (você está decidindo) ou `Pendente` (você está adiando uma decisão sabendo que vai precisar tomá-la).
3. Sempre preencha "Reabrir quando" com um gatilho **concreto e observável** — não "quando der vontade".
4. Se substituir uma ADR antiga, marque a antiga como `Substituído por ADR-NNN` e referencie.
