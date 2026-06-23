import { getRouteApi } from "@tanstack/react-router"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { BarChart3, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { preserveScroll } from "@/lib/preserve-scroll"

import { ANALYTICS_SUMMARY_QUERY_KEY } from "./api/use-analytics-summary"
import { ANALYTICS_TOP_FARMERS_QUERY_KEY } from "./api/use-analytics-top-farmers"
import { AnalyticsTabContent } from "./components/analytics-tab-content"
import type { AnalyticsTab } from "./search"

const analyticsRouteApi = getRouteApi("/_authenticated/analytics")

const ANALYTICS_QUERY_KEYS = [
  ANALYTICS_SUMMARY_QUERY_KEY,
  ANALYTICS_TOP_FARMERS_QUERY_KEY,
] as const

const AnalyticsPage = () => {
  const { tab } = analyticsRouteApi.useSearch()
  const navigate = analyticsRouteApi.useNavigate()
  const queryClient = useQueryClient()
  const summaryFetching = useIsFetching({ queryKey: ANALYTICS_SUMMARY_QUERY_KEY })
  const topFarmersFetching = useIsFetching({
    queryKey: ANALYTICS_TOP_FARMERS_QUERY_KEY,
  })
  const isRefreshing = summaryFetching > 0 || topFarmersFetching > 0

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as AnalyticsTab },
      ...preserveScroll,
    })
  }

  const handleRefresh = () => {
    for (const queryKey of ANALYTICS_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Analytics</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="min-w-0">
          <AnalyticsTabContent quantityMode="current" enabled={tab === "current"} />
        </TabsContent>

        <TabsContent value="initial" className="min-w-0">
          <AnalyticsTabContent quantityMode="initial" enabled={tab === "initial"} />
        </TabsContent>

        <TabsContent value="outgoing" className="min-w-0">
          <AnalyticsTabContent quantityMode="outgoing" enabled={tab === "outgoing"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsPage
