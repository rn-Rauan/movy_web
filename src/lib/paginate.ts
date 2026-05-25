import type { Paginated } from "@/lib/types";

type PageResult<T> = T[] | Paginated<T>;

type FetchAllOptions = {
  /** Itens por página a pedir ao backend. Default 100. */
  limit?: number;
  /** Teto de páginas — evita loop infinito se o backend não devolver totalPages. Default 50. */
  maxPages?: number;
};

/**
 * Pagina um endpoint `?page=&limit=` e devolve todos os itens concatenados.
 *
 * Regra de parada (robusta — baseada no que o servidor devolve, NÃO no tamanho pedido):
 * - resposta é array puro (sem envelope) → backend mandou tudo de uma vez, para.
 * - `data` vazio → acabou.
 * - `totalPages` veio e já alcançamos → para.
 * - teto `maxPages` como salvaguarda.
 *
 * Não compara `data.length` com o `limit` pedido: servidores costumam capar a página
 * abaixo do solicitado, o que faria um loop ingênuo encerrar cedo e descartar dados.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PageResult<T>>,
  opts: FetchAllOptions = {},
): Promise<T[]> {
  const limit = opts.limit ?? 100;
  const maxPages = opts.maxPages ?? 50;
  const out: T[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchPage(page, limit);

    // Array puro = endpoint não paginado nesta resposta; já temos tudo.
    if (Array.isArray(res)) {
      out.push(...res);
      break;
    }

    const data = res.data ?? [];
    out.push(...data);

    if (data.length === 0) break;
    if (res.totalPages != null && page >= res.totalPages) break;
  }

  return out;
}
