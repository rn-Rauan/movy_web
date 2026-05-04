# Roadmap — Movy Web

> Visão estratégica em fases. Pra **estado atual por feature**, ver [PROGRESS.md](./PROGRESS.md). Pra **próxima ação concreta**, ver [BACKLOG.md](./BACKLOG.md). Pra **por que** uma decisão técnica foi tomada, ver [DECISIONS.md](./DECISIONS.md).

**Última atualização:** 2026-05-03

---

## Princípios de priorização

1. **Operação real antes de polish.** Antes de melhorar UX existente, fechar o loop operacional fim-a-fim (passageiro reserva → motorista vê viagem → admin vê tudo aconteceu).
2. **Uma feature por vez, fim-a-fim.** Cada feature concluída deve estar 100% — não meio admin + meio driver.
3. **Adiar o que não é MVP.** Multi-org, integração de pagamento real, PWA, testes — todos ficam pra fases posteriores. Decisões de adiamento ficam em [DECISIONS.md](./DECISIONS.md).

---

## Fase 1 — Operação Mínima Viável

**Objetivo:** Fechar o ciclo operacional. Hoje o admin cria viagens e o passageiro se inscreve, mas não há "execução" da viagem visível em lugar nenhum.

**Entregáveis:**

- [ ] Driver: lista de viagens designadas (`/_protected/_driver/my-trips` deixa de ser placeholder)
- [ ] Driver: marcar presença de cada passageiro
- [ ] Driver: marcar pagamento de cada passageiro (dinheiro/Pix/cartão como string registrada — sem gateway ainda)
- [ ] Admin: ver presença e pagamento de cada inscrição na tela de detalhe da viagem
- [ ] Admin: cancelar inscrição individual (hoje só o próprio passageiro cancela)

**Critério de "concluído":** uma viagem real consegue ser planejada (admin) → reservada (passageiro) → executada (motorista marca presença e pagamento) → auditada (admin vê resultado), tudo sem precisar tocar no banco.

**Fora de escopo desta fase:** notificação automática, comprovante, gateway de pagamento real.

---

## Fase 2 — Confiabilidade

**Objetivo:** Reduzir os caminhos onde o usuário fica preso ou perde dados.

**Entregáveis:**

- [ ] Forgot password (recuperação por e-mail)
- [ ] Notificações in-app (toast/badge) quando status de viagem muda — passageiro precisa saber se a viagem foi cancelada
- [ ] Tratamento de erro padronizado (retry para erros de rede, fallback claro pra 5xx)
- [ ] Adoção de React Query nas listas que mais sofrem stale data (lista de viagens admin, minhas inscrições) — ver [DECISIONS.md ADR-002](./DECISIONS.md)
- [ ] Convergir padrão de fetching: ou tudo via feature hooks, ou tudo via React Query — não os dois
- [ ] Remover duplicação `/_admin/drivers` ↔ sheet em `/_admin/organization`

**Critério de "concluído":** usuário comum consegue recuperar conta, é avisado de mudanças relevantes, e admin não vê dados desatualizados sem refresh manual.

---

## Fase 3 — Conversão & Escala

**Objetivo:** Tornar o produto interessante pra mais que 1 organização.

**Entregáveis:**

- [ ] Filtros e busca no marketplace público (data, origem/destino, preço)
- [ ] Ordenação (data crescente / preço crescente)
- [ ] Dashboard admin rico (receita prevista, taxa de ocupação, top rotas, cancelamentos)
- [ ] Multi-organização: admin pode trocar entre organizações (encerra ADR-001)
- [ ] Onboarding de membros não-admin para uma organização

**Critério de "concluído":** marketplace ajuda passageiro a encontrar viagem rapidamente; admin de 2+ orgs consegue gerenciar todas; dashboard responde "como meu negócio está indo?".

---

## Fase 4 — Comercial

**Objetivo:** Habilitar cobrança real e compliance.

**Entregáveis:**

- [ ] Integração de pagamento (Pix instantâneo, no mínimo)
- [ ] Comprovante / recibo de pagamento (PDF ou link)
- [ ] Termos de uso e Política de Privacidade (LGPD)
- [ ] Confirmação de e-mail no signup
- [ ] Decisão sobre 2FA e XSS hardening (revisitar tokens em localStorage)

**Critério de "concluído":** uma org pode operar comercialmente em produção sem dependências externas manuais.

---

## Decisões intencionalmente adiadas

Cada uma destas é uma escolha consciente, não esquecimento. Detalhes em [DECISIONS.md](./DECISIONS.md):

- **Multi-organização** → Fase 3 (ADR-001)
- **React Query** → Fase 2 (ADR-002)
- **Framework de testes** → indefinido, decidir antes da Fase 4 (ADR-003)
- **PWA / instalável** → indefinido, avaliar após Fase 3
- **Pagamento real** → Fase 4
- **2FA** → indefinido, avaliar após Fase 4
