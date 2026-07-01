# Verificação e Testes

## Estado Atual

O frontend não possui framework de testes automatizados configurado. A verificação funcional é manual, apoiada por build, lint e roteiro E2E.

## Comandos de Verificação

```bash
npm run lint
npm run build
```

Use `npm run format:check` quando quiser validar formatação sem alterar arquivos.

## Roteiro Manual

O roteiro completo está em [manual-testing.md](manual-testing.md). Ele cobre:

- autenticação;
- cadastro B2C e B2B;
- marketplace público;
- booking;
- perfil;
- área administrativa;
- área do motorista;
- fluxos cruzados e casos de borda.

## Lacunas Conhecidas

- Não há testes unitários de hooks/services.
- Não há testes E2E automatizados.
- O roteiro manual depende de dados de demonstração consistentes no backend.

## Sugestão de Evolução

Quando o produto se aproximar de operação real, a primeira cobertura automatizada recomendada é:

1. Testes de services e helpers com Vitest.
2. Testes de hooks críticos com Testing Library.
3. E2E dos fluxos de login, reserva e operação da viagem.
