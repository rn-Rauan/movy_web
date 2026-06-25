# Movy — Relatório Técnico de Software (Frontend)

> **Nota de uso.** Este documento segue a estrutura do modelo de Relatório Técnico de Software (RTS) do IFPI — as seções e a numeração espelham o template LaTeX, de modo que a conversão para `.tex` seja direta (o título abaixo corresponde a `\section`, os subtítulos a `\subsection` e `\subsubsection`). O foco atual é o **frontend** do Movy. Como o sistema é completo (frontend + backend), os pontos em que o conteúdo do backend deve ser incorporado estão sinalizados ao longo do texto por blocos **» Junção com o backend**. Trechos que, no template, exigem figuras (Casos de Uso, Diagrama de Classes, DER e prints de Interfaces) ficam indicados como espaços a preencher; a única figura tratada aqui é o **diagrama de arquitetura do frontend**, por ser pertinente a esta parte do trabalho.

---

## Sumário

1. [Introdução](#1-introdução)
   - 1.1 [Objetivos](#11-objetivos)
2. [Tecnologias Envolvidas](#2-tecnologias-envolvidas)
3. [Modelagem do Projeto](#3-modelagem-do-projeto)
   - 3.1 [Levantamento de Requisitos](#31-levantamento-de-requisitos)
   - 3.2 [Casos de Uso](#32-casos-de-uso)
   - 3.3 [Diagrama de Classes](#33-diagrama-de-classes)
   - 3.4 [Arquitetura do Sistema](#34-arquitetura-do-sistema)
   - 3.5 [Diagrama Entidade-Relacionamento](#35-diagrama-entidade-relacionamento)
   - 3.6 [Interfaces](#36-interfaces)
4. [Software](#4-software)
   - 4.1 [Implantação](#41-implantação)
   - 4.2 [Exemplo de Código](#42-exemplo-de-código)
   - 4.3 [Testes](#43-testes)
5. [Considerações Finais](#5-considerações-finais)

---

## 1. Introdução

O transporte fretado — o deslocamento recorrente de grupos de passageiros entre pontos fixos, como o trajeto casa–universidade ou casa–trabalho — é tradicionalmente operado por pequenas e médias empresas que dependem de processos manuais para divulgar rotas, controlar a lotação dos veículos e registrar pagamentos. Esse modelo apresenta atritos em ambos os lados: o passageiro tem dificuldade de localizar uma vaga e de acompanhar sua reserva, enquanto a empresa carece de uma visão consolidada de ocupação, receita e operação diária.

O **Movy** é uma plataforma, no modelo _Software as a Service_ (SaaS), concebida para reduzir esse atrito. Pelo lado da empresa, permite cadastrar rotas recorrentes, gerar automaticamente as viagens correspondentes e gerenciar motoristas, veículos e inscrições. Pelo lado do passageiro, oferece um catálogo público pesquisável, no qual é possível localizar uma viagem, reservar uma vaga e acompanhar a inscrição. O sistema é dividido em duas partes: uma **interface de programação de aplicações (API)**, responsável pela lógica de domínio e pela persistência, e uma **aplicação web cliente**, responsável por toda a interação com o usuário. Este relatório trata da segunda.

A motivação para documentar especificamente o frontend está em que ele concentra a experiência do usuário e materializa, em telas e fluxos, as regras expostas pela API. Um princípio condutor de todo o projeto é que o cliente **não detém regras de negócio autoritativas**: ele orquestra a interação, valida entradas localmente para fornecer retorno imediato, traduz os estados do domínio em elementos visuais e delega toda decisão definitiva ao backend. Compreender como essa orquestração é estruturada — em camadas, com controle de acesso por papel e comunicação resiliente com a API — é o objetivo central deste documento.

> **» Junção com o backend.** A caracterização do problema e da solução pode ser unificada com a introdução do relatório do backend, mantendo-se um único enunciado de contexto e motivação para o sistema Movy como um todo, e reservando este parágrafo metodológico como recorte da camada de apresentação.

### 1.1 Objetivos

#### 1.1.1 Geral

Desenvolver a aplicação web cliente do Movy, _mobile-first_, que disponibilize aos passageiros a descoberta e a reserva de viagens de transporte fretado e às empresas a gestão operacional de rotas, viagens, motoristas e veículos, consumindo a API do sistema e garantindo controle de acesso por papel, comunicação resiliente e experiência de uso consistente.

#### 1.1.2 Específicos

Os objetivos específicos correspondem aos requisitos funcionais implementados no frontend, agrupados por contexto de acesso:

**Contexto público (sem autenticação):**

- **RF01** — Apresentar a página inicial de divulgação com chamadas à ação para cadastro de passageiro e de empresa.
- **RF02** — Exibir o catálogo público de viagens, agrupado por rota, com busca e filtros por data, turno e ordenação.
- **RF03** — Exibir o detalhe público de uma viagem, com datas alternativas da mesma rota e compartilhamento por _link_.
- **RF04** — Exibir o diretório de organizações ativas e o perfil público de cada organização.
- **RF05** — Exibir o comparativo público de planos comerciais.

**Contexto de autenticação:**

- **RF06** — Permitir login, cadastro de passageiro (B2C) e cadastro de empresa com administrador (B2B).
- **RF07** — Permitir recuperação de senha e verificação de e-mail, com autenticação automática ao concluir.

**Contexto de usuário autenticado (passageiro):**

- **RF08** — Permitir a reserva de uma vaga, com seleção de pontos de embarque e desembarque, tipo de inscrição e método de pagamento.
- **RF09** — Permitir a gestão das inscrições do usuário (listar com filtros, detalhar e cancelar).
- **RF10** — Permitir a edição do perfil pessoal e da senha.
- **RF11** — Permitir o autosserviço de perfil de motorista (criar e editar dados de habilitação).

**Contexto de administrador:**

- **RF12** — Apresentar painel com métricas operacionais e financeiras da organização.
- **RF13** — Permitir o CRUD de modelos de rota e a geração de instâncias de viagem a partir deles.
- **RF14** — Permitir o CRUD de viagens, suas transições de estado e a atribuição de motorista e veículo.
- **RF15** — Permitir a gestão de motoristas e veículos da organização.
- **RF16** — Permitir a gestão operacional de inscrições na viagem (confirmação de presença e de pagamento).
- **RF17** — Permitir a configuração do agendamento automático e a administração do plano de assinatura.

**Contexto de motorista:**

- **RF18** — Apresentar ao motorista a lista de viagens que lhe foram atribuídas.

---

## 2. Tecnologias Envolvidas

A seleção tecnológica buscou equilibrar produtividade, segurança de tipos e adequação ao caráter _mobile-first_ do produto. A Tabela 1 resume as principais tecnologias e o papel de cada uma.

**Tabela 1 — Tecnologias utilizadas no frontend**

| Tecnologia                 | Descrição / Papel                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| React 19                   | Biblioteca de interface; modelo declarativo baseado em componentes e _hooks_.            |
| TypeScript (_strict_)      | Linguagem; contratos de dados explícitos com a API e verificação em tempo de compilação. |
| TanStack Router / Start    | Roteamento baseado em arquivos, com segurança de tipos e _layouts_ aninhados.            |
| Tailwind CSS v4            | Estilização _utility-first_ com sistema de design próprio por _tokens_.                  |
| shadcn/ui (Radix UI)       | Componentes de interface acessíveis, sob modelo de _ownership_.                          |
| Zod + React Hook Form      | Validação declarativa de formulários, reaproveitada como tipos por inferência.           |
| `fetch` nativo encapsulado | Cliente HTTP único, com renovação de sessão e normalização de erros.                     |
| Sonner                     | Notificações transitórias (_toasts_).                                                    |
| Lucide React               | Conjunto de ícones otimizável por _tree-shaking_.                                        |
| Vite (preset Lovable)      | Ferramenta de construção; o preset encapsula plugins e o adaptador de implantação.       |
| Cloudflare Workers         | Plataforma de implantação em execução de borda (_edge_).                                 |

Registra-se que a biblioteca TanStack React Query consta entre as dependências, porém **não é consumida** por nenhuma rota: o gerenciamento de estado de servidor é feito, no estágio atual, por _hooks_ próprios sobre a Context API do React. A não adoção imediata é uma decisão consciente, retomada na Seção 5.

> **» Junção com o backend.** Esta tabela pode ser fundida com a tabela de tecnologias do backend (linguagem, framework, banco de dados, contêineres), formando um único quadro do sistema; recomenda-se, nesse caso, separar visualmente as linhas por camada (cliente e servidor).

---

## 3. Modelagem do Projeto

### 3.1 Levantamento de Requisitos

Os requisitos funcionais do frontend foram enumerados na Seção 1.1.2, por corresponderem aos objetivos específicos do trabalho. Esta seção registra os **requisitos não funcionais** que orientaram as decisões de projeto da camada de apresentação.

- **RNF01 (Usabilidade)** — A interface é _mobile-first_, priorizando o uso em telas pequenas e mantendo legibilidade em telas maiores por meio de largura de conteúdo limitada.
- **RNF02 (Localização)** — Toda a interface é em português do Brasil; datas e valores monetários seguem as convenções locais.
- **RNF03 (Confiabilidade de tipos)** — O código é escrito em TypeScript no modo _strict_, com contratos de dados explícitos para as respostas da API.
- **RNF04 (Resiliência de sessão)** — A expiração de credenciais é tratada de forma transparente, com renovação automática e única (deduplicada) diante de respostas de autorização negada.
- **RNF05 (Tratamento uniforme de erros)** — As mensagens ao usuário derivam de códigos de erro estáveis fornecidos pelo backend, e não do texto das mensagens.
- **RNF06 (Segurança de acesso)** — O acesso às telas é controlado por papel, de forma centralizada, antes da renderização.
- **RNF07 (Acessibilidade)** — Os componentes de interface apoiam-se em primitivas acessíveis (Radix UI), com rótulos e navegação por teclado.
- **RNF08 (Consistência temporal)** — Horários são sempre apresentados em horário de Brasília, ainda que o backend os armazene em UTC.
- **RNF09 (Implantação)** — A aplicação é implantada em ambiente de execução de borda, dependendo apenas da URL base da API como configuração.

> **» Junção com o backend.** Os requisitos não funcionais de desempenho, disponibilidade e segurança de dados (ex.: tempo de resposta, política de senhas, criptografia em repouso) pertencem ao relatório do backend e devem ser consolidados com estes, evitando duplicação dos itens que são compartilhados (como segurança de acesso).

### 3.2 Casos de Uso

Do ponto de vista do frontend, os atores correspondem aos papéis descritos na Seção 1.1.2 — **Visitante**, **Passageiro**, **Motorista** e **Administrador** —, em precedência crescente de capacidades. Em síntese, o Visitante explora o catálogo e os perfis públicos; o Passageiro reserva e gerencia inscrições e pode candidatar-se a motorista; o Motorista visualiza e opera as viagens atribuídas; e o Administrador gerencia rotas, viagens, motoristas, veículos, plano e métricas.

> **» Junção com o backend / artefato existente.** O diagrama de casos de uso (versão simplificada já elaborada pelo autor) deve ser inserido aqui, e o diagrama consolidado de casos de uso do sistema pertence à modelagem geral, compartilhada com o backend. No template LaTeX, esta subseção recebe a figura correspondente (`\includegraphics` + `\caption{Diagrama de casos de uso.}`).

### 3.3 Diagrama de Classes

O frontend não possui um modelo de classes de domínio próprio: as entidades de negócio são definidas no backend, e o cliente as representa por meio de **tipos de dados** (interfaces TypeScript) que espelham os contratos da API. Esses tipos — entre eles organização, modelo de rota, instância de viagem, inscrição, pagamento, motorista, veículo, plano e assinatura — residem em um módulo central de tipos e servem de contrato verificável em tempo de compilação para todas as respostas consumidas pelos serviços. Trata-se, portanto, de uma projeção do modelo de domínio no cliente, e não de um modelo independente.

> **» Junção com o backend.** O Diagrama de Classes propriamente dito (entidades, atributos, associações e métodos) pertence à modelagem do backend e deve ser incorporado a partir daquele relatório. Recomenda-se, neste ponto, apenas referenciá-lo e ressaltar que os tipos do cliente são derivados dele.

### 3.4 Arquitetura do Sistema

A arquitetura do frontend espelha, no cliente, a separação em camadas adotada no backend. Em vez de concentrar lógica nos componentes de tela, o projeto distribui responsabilidades em quatro camadas, atravessadas por um fluxo de dados unidirecional. A Figura 1 apresenta essa organização.

**Figura 1 — Arquitetura em camadas do frontend**

```
┌──────────────────────────────────────────────────────────────┐
│  APRESENTAÇÃO                                                  │
│  Rotas (controladores finos)  +  Componentes (só props)        │
└───────────────────────────────┬──────────────────────────────┘
                                 │  invocam
┌───────────────────────────────▼──────────────────────────────┐
│  CASOS DE USO                                                  │
│  Hooks de feature  (estado + obtenção de dados + efeitos)      │
└───────────────────────────────┬──────────────────────────────┘
                                 │  chamam
┌───────────────────────────────▼──────────────────────────────┐
│  SERVIÇOS  (padrão repositório, um arquivo por domínio)        │
│  trips · bookings · organizations · drivers · templates · ...  │
└───────────────────────────────┬──────────────────────────────┘
                                 │  usam
┌───────────────────────────────▼──────────────────────────────┐
│  CLIENTE HTTP  (lib/api.ts)                                    │
│  autenticação · renovação de sessão · normalização de erros    │
└───────────────────────────────┬──────────────────────────────┘
                                 │  HTTP (JSON)
                                 ▼
                          ╔═══════════════╗
                          ║   API (BE)    ║
                          ╚═══════════════╝
```

> _Sugestão de produção da figura:_ o diagrama acima pode ser redesenhado em ferramenta vetorial ou gerado a partir de fonte Mermaid/PlantUML para exportar como imagem no LaTeX (`\includegraphics`). O conteúdo essencial são as quatro camadas e o sentido único das setas.

A camada de **apresentação** compõe-se das rotas e dos componentes. As rotas são deliberadamente finas — controladores enxutos cuja função é instanciar um _hook_ de caso de uso e repassar seus dados aos componentes. Os componentes recebem dados apenas por propriedades e não realizam requisições próprias, mantendo-se puramente apresentacionais e reutilizáveis. A camada de **casos de uso** materializa-se nos _hooks de feature_, que encapsulam a obtenção de dados, o estado associado (carregamento, erro, conteúdo) e os efeitos colaterais de uma operação de domínio. A camada de **serviços** implementa o padrão _repository_: cada arquivo agrupa as chamadas a um conjunto coeso de _endpoints_ e esconde detalhes de transporte. Por fim, o **cliente HTTP** é o ponto único de comunicação com o backend, responsável por anexar credenciais, interpretar respostas, normalizar erros e renovar a sessão de forma transparente.

Essa estratificação confere ao sistema três propriedades. A **localidade de mudança** faz com que alterações no contrato de um _endpoint_ afetem somente o serviço correspondente, e mudanças visuais não toquem a obtenção de dados. A **previsibilidade** decorre da convenção de que nenhum componente ou rota chama o cliente HTTP diretamente — toda comunicação passa pelos serviços. A **coesão por domínio** é reforçada pela organização em _módulos de feature_: cada domínio (viagens, inscrições, organizações, motoristas, modelos de rota, veículos, agendamento, assinaturas e financeiro) reúne, em um único diretório, seus _hooks_ e componentes.

Sobre essa base, dois mecanismos transversais completam a arquitetura. O **controle de acesso** é realizado por _layouts_ de rota sem caminho próprio (_pathless layouts_): um _layout_ verifica a autenticação uma única vez para todas as rotas protegidas, e outros dois, aninhados sob ele, verificam os papéis de administrador e de motorista. A composição resulta em uma cadeia de verificações, sem que os segmentos de proteção apareçam na URL. O **estado global de sessão** — identidade e papéis do usuário — é provido por dois contextos encadeados na raiz da aplicação: o de autenticação envolve o de papel, garantindo que a determinação de papel só ocorra quando a identidade já está disponível.

> **» Junção com o backend.** Esta subseção descreve a arquitetura do cliente. A arquitetura do servidor (camadas de domínio, aplicação e infraestrutura, segundo _Clean Architecture_ e DDD) e o diagrama de implantação completo (cliente em borda + API + banco) devem vir do relatório do backend. Sugere-se uma figura de visão geral do sistema que posicione o frontend como consumidor da API.

### 3.5 Diagrama Entidade-Relacionamento

Não se aplica diretamente ao frontend, que não acessa banco de dados: a persistência é responsabilidade exclusiva do backend, e o cliente conhece apenas as representações expostas pela API.

> **» Junção com o backend.** O Diagrama Entidade-Relacionamento pertence integralmente ao relatório do backend e deve ser incorporado a partir dele. No template LaTeX, esta subseção recebe a figura correspondente.

### 3.6 Interfaces

A aplicação adota uma **moldura comum** para a maior parte das telas, responsável pelo cabeçalho — com título, botão opcional de retorno e ação contextual — e pela barra de navegação inferior, que apresenta abas distintas conforme o papel do usuário. Essa moldura também concentra o encerramento de sessão. As listagens utilizam três estados padronizados — carregamento (com esqueletos de conteúdo), erro e vazio legítimo (com ilustração e ação de saída) —, evitando telas em branco. Para a edição de dados, adota-se o padrão de uma visualização somente-leitura acompanhada de um controle que abre um formulário em folha inferior ou diálogo.

As principais telas, por contexto, são: a página inicial e o catálogo público com detalhe de viagem; o diretório e o perfil público de organizações; as telas de autenticação e recuperação; o formulário de reserva e a lista de inscrições do passageiro; o perfil pessoal e o perfil de motorista; e, no contexto administrativo, o painel de métricas, os cadastros de modelos de rota, viagens, motoristas e veículos, a tela de detalhe da viagem (compartilhada com o motorista) e as telas de plano e financeiro.

> **» Artefato a inserir.** Os prints ou protótipos das telas devem ser inseridos nesta subseção (`\includegraphics` + `\caption`), preferencialmente cobrindo o catálogo, o detalhe da viagem, o formulário de reserva, o painel administrativo e a tela de detalhe da viagem com gestão de inscrições.

---

## 4. Software

### 4.1 Implantação

O ambiente de desenvolvimento é estabelecido a partir de um arquivo de exemplo de variáveis de ambiente, cuja única variável relevante é a URL base da API (`VITE_API_URL`). Os passos para execução local são:

1. Instalar as dependências do projeto (`npm install`).
2. Copiar o arquivo `.env.example` para `.env` e ajustar `VITE_API_URL` (valor padrão: `http://localhost:5701`).
3. Executar o servidor de desenvolvimento (`npm run dev`).

Os demais comandos cobrem a construção de produção (`npm run build`), a construção em modo de desenvolvimento (`npm run build:dev`), a verificação de estilo (`npm run lint`) e a formatação automática (`npm run format`). A configuração de construção apoia-se em um preset que encapsula os plugins necessários (roteamento, React, Tailwind, resolução de _aliases_ e adaptador de implantação); por convenção, não se adicionam plugins manualmente ao arquivo de configuração, sob pena de duplicação. A aplicação é implantada em ambiente de execução de borda, por meio da plataforma de _workers_ da Cloudflare, para a qual o processo de construção gera os artefatos.

> **» Junção com o backend.** As instruções de implantação do servidor (contêineres, variáveis de ambiente, migração de banco) e o roteiro de execução conjunta (subir a API antes do cliente) devem ser consolidados com este, formando um único guia de implantação do sistema.

### 4.2 Exemplo de Código

Os exemplos a seguir ilustram as quatro camadas da arquitetura descrita na Seção 3.4, na ordem em que o fluxo de dados as atravessa.

O **cliente HTTP** centraliza a comunicação. O trecho abaixo evidencia a anexação automática de credenciais, a renovação única (deduplicada) diante de uma resposta 401 e a normalização do erro em uma exceção tipada que carrega o código de erro estável do backend:

**Código 1 — Cliente HTTP com renovação transparente de sessão (`lib/api.ts`)**

```ts
export async function api<T = unknown>(
  path: string,
  init: RequestInit & { auth?: boolean; _retry?: boolean } = {},
): Promise<T> {
  const { auth = true, _retry = false, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = tokenStorage.access;
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  // Tenta uma única renovação de token em caso de 401 e repete a requisição.
  if (res.status === 401 && auth && !_retry) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    try {
      await refreshPromise;
      return api<T>(path, { ...init, _retry: true });
    } catch {
      /* renovação falhou — propaga o erro original */
    }
  }

  if (!res.ok) {
    const message = (data && data.message) || `Erro ${res.status}`;
    const errorCode = data && typeof data.error === "string" ? data.error : null;
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : String(message),
      res.status,
      data,
      errorCode,
    );
  }
  return data as T;
}
```

A **camada de serviços** organiza os _endpoints_ por domínio. O serviço de inscrições, por exemplo, expõe operações de alto nível que escondem o método HTTP e a serialização:

**Código 2 — Serviço de inscrições (`services/bookings.service.ts`)**

```ts
export const bookingsService = {
  listForUser: () => api<Booking[] | { data: Booking[] }>("/bookings/user"),

  getDetails: (bookingId: string) => api<BookingDetails>(`/bookings/${bookingId}/details`),

  create: (data: {
    tripInstanceId: string;
    enrollmentType: EnrollmentType;
    boardingStop: string;
    alightingStop: string;
    method: PaymentMethod;
  }) => api("/bookings", { method: "POST", body: JSON.stringify(data) }),

  cancel: (bookingId: string) => api<Booking>(`/bookings/${bookingId}/cancel`, { method: "PATCH" }),
};
```

A **camada de casos de uso** combina serviço, estado e lógica de apresentação. O _hook_ de inscrições do usuário obtém a lista e ainda oferece busca e filtragem por estado, derivando o estado de carregamento da ausência simultânea de conteúdo e erro:

**Código 3 — Hook de caso de uso (`features/bookings/hooks/useBookings.ts`)**

```ts
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");

  useEffect(() => {
    bookingsService
      .listForUser()
      .then((res) => setBookings(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (
        q &&
        !b.boardingStop?.toLowerCase().includes(q) &&
        !b.alightingStop?.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [bookings, search, statusFilter]);

  return {
    bookings,
    filtered,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loading: bookings === null && !error,
    error,
  };
}
```

Por fim, a **camada de apresentação** consome o _hook_ em uma rota fina, cuja responsabilidade é apenas decidir entre os estados (não autenticado, carregando, erro, vazio, conteúdo) e delegar a renderização aos componentes:

**Código 4 — Rota fina (`routes/_protected.my-bookings.tsx`)**

```tsx
export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsContent() {
  const { filtered, search, setSearch, statusFilter, setStatusFilter, loading, error } =
    useBookings();

  return (
    <AppShell title="Minhas inscrições">
      {/* ...campo de busca e filtros por estado... */}
      {loading ? (
        <LoadingList count={2} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <BookingsList bookings={filtered} />
      )}
    </AppShell>
  );
}
```

Em conjunto, os quatro trechos evidenciam o fluxo unidirecional: a rota consome o _hook_, que chama o serviço, que atravessa o cliente HTTP até a API — sem que nenhuma camada superior conheça os detalhes da inferior.

### 4.3 Testes

Em coerência com o estágio do produto e o tamanho reduzido da equipe, a estratégia de verificação do frontend é, no momento, **predominantemente manual**, estruturada em um roteiro de dezenas de cenários que cobrem os caminhos principais, os fluxos que cruzam contextos de acesso e os casos de borda. A integração contínua executa a verificação de estilo, a análise estática e a construção, deixando a verificação funcional a cargo do roteiro manual. A adoção de testes automatizados (provavelmente Vitest com _Testing Library_ para _hooks_ e serviços, e uma ferramenta de ponta a ponta para os fluxos) está condicionada à aproximação da operação comercial, tendo o fluxo de reserva como primeiro candidato à cobertura. A Tabela 2 ilustra o formato dos casos de teste manuais.

**Tabela 2 — Exemplos de casos de teste manuais**

| Caso                                              | Resultado esperado                         | Status |
| ------------------------------------------------- | ------------------------------------------ | ------ |
| Login com credenciais válidas                     | Sessão criada e redirecionamento por papel | OK     |
| Login com credenciais inválidas                   | Mensagem de erro, sem sessão               | OK     |
| Expiração do _token_ durante navegação            | Renovação transparente, ação concluída     | OK     |
| Reserva com mesmo ponto de embarque e desembarque | Bloqueio com mensagem de validação         | OK     |
| Cancelamento fora da janela permitida             | Bloqueio com mensagem do _errorCode_       | OK     |
| Acesso a rota administrativa sem papel de admin   | Redirecionamento para a raiz               | OK     |

> **» Junção com o backend.** Os testes de unidade e de integração da API (e suas evidências) devem ser incorporados a partir do relatório do backend; os cenários de ponta a ponta listados aqui exercitam ambos os lados e podem ser apresentados como verificação integrada do sistema.

---

## 5. Considerações Finais

O frontend do Movy demonstra a aplicação de princípios de separação de responsabilidades análogos aos do backend. A estratificação em rotas finas, _hooks_ de caso de uso, serviços e um cliente HTTP único confere ao sistema localidade de mudança e previsibilidade; o roteamento baseado em arquivos, combinado a _layouts_ sem caminho, fornece um mecanismo centralizado de controle de acesso por papel; e a concentração da comunicação com a API em um ponto único permite tratar de forma uniforme questões transversais como a renovação de sessão e a normalização de erros.

Igualmente relevante, do ponto de vista de engenharia, é a maturidade com que o projeto registra suas limitações conscientes, documentadas como decisões arquiteturais com critérios objetivos de revisão. As principais são: o suporte, no estágio atual, a apenas uma organização por administrador; a não adoção imediata de uma biblioteca de estado de servidor, com a consequente coexistência de dois estilos de obtenção de dados entre rotas de passageiro e de administrador; a ausência de testes automatizados; e o armazenamento de credenciais no `localStorage`, aceito em troca de simplicidade e marcado para reavaliação antes da operação comercial. Em todos os casos, trata-se de escolhas datadas e revisáveis, e não de omissões.

As direções de evolução decorrem diretamente desses registros: a adoção gradual de uma biblioteca de estado de servidor e a unificação dos estilos de obtenção de dados; a introdução de uma camada de testes automatizados a partir do fluxo de reserva; o fortalecimento do armazenamento de credenciais; e o suporte à operação de administradores com múltiplas organizações. Cada uma encontra, na arquitetura atual, um ponto de inserção já previsto, o que sugere que as fundações descritas neste relatório são adequadas ao crescimento esperado do produto.

> **» Junção com o backend.** As considerações finais podem ser unificadas em uma síntese única do sistema Movy, somando os resultados e as limitações de ambas as camadas e apresentando um roteiro de evolução conjunto.

---

> **Apêndice — Mapa de conversão para o template LaTeX (RTS).** Este documento mapeia diretamente as seções do modelo: o título corresponde ao bloco de `\section{...}`; os níveis `##`, `###` e `####` correspondem a `\section`, `\subsection` e `\subsubsection`. As tabelas devem ser convertidas para o ambiente `table` com `booktabs`; os blocos de código, para `lstlisting` com `language=JavaScript` (ou `TypeScript`, se definida a linguagem); e os blocos **» Junção com o backend** devem ser resolvidos (incorporando o conteúdo do backend) ou removidos antes da entrega final. As seções de Resumo, Abstract, Referências e Anexos do template não foram preenchidas aqui por dependerem do trabalho completo e das normas da banca.
