import type { QueryClient } from "@tanstack/react-query"

import { DAYBOOK_QUERY_KEY, type DaybookResult } from "@/features/daybook/api/use-daybook"
import {
  DAYBOOK_SEARCH_QUERY_KEY,
  type DaybookSearchResult,
} from "@/features/daybook/api/use-daybook-search"
import {
  isIncomingDaybookEntry,
  type IncomingDaybookEntry,
} from "@/features/daybook/types"

export function findIncomingEntryInDaybookCache(
  queryClient: QueryClient,
  id: string
): IncomingDaybookEntry | undefined {
  const listQueries = queryClient.getQueriesData<DaybookResult>({
    queryKey: DAYBOOK_QUERY_KEY,
  })

  for (const [, data] of listQueries) {
    const found = data?.entries.find(
      (entry) => isIncomingDaybookEntry(entry) && entry._id === id
    )
    if (found) return found
  }

  const searchQueries = queryClient.getQueriesData<DaybookSearchResult>({
    queryKey: DAYBOOK_SEARCH_QUERY_KEY,
  })

  for (const [, data] of searchQueries) {
    const found = data?.incoming.find((entry) => entry._id === id)
    if (found) return found
  }

  return undefined
}
