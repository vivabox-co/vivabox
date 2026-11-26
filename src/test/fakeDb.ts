// Minimal chainable stand-in for the Supabase query builder, for route tests.
// Every call is recorded; the terminal call (maybeSingle / single / awaiting an
// insert or update) is answered by the handler registered for that table+action.

export type Filter = [column: string, operator: "eq" | "gt", value: unknown]

export type Query = {
  table: string
  action: "select" | "update" | "insert"
  payload?: Record<string, unknown>
  filters: Filter[]
}

export type Result = { data?: unknown; error?: unknown }
export type Handler = (query: Query) => Result | Promise<Result>

export function createFakeDb(handlers: Record<string, Handler>) {
  const queries: Query[] = []

  function builder(table: string) {
    const query: Query = { table, action: "select", filters: [] }

    const run = async (): Promise<Result> => {
      queries.push(query)
      const handler = handlers[`${table}.${query.action}`]
      if (!handler) throw new Error(`No fake handler for ${table}.${query.action}`)
      const result = await handler(query)
      return { data: null, error: null, ...result }
    }

    const b = {
      select: () => b,
      update: (payload: Record<string, unknown>) => ((query.action = "update"), (query.payload = payload), b),
      insert: (payload: Record<string, unknown>) => ((query.action = "insert"), (query.payload = payload), b),
      eq: (column: string, value: unknown) => (query.filters.push([column, "eq", value]), b),
      gt: (column: string, value: unknown) => (query.filters.push([column, "gt", value]), b),
      maybeSingle: run,
      single: run,
      then: (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) => run().then(resolve, reject),
    }
    return b
  }

  return {
    client: { from: builder },
    queries,
    last: (table: string, action: Query["action"]) =>
      [...queries].reverse().find((q) => q.table === table && q.action === action),
  }
}
