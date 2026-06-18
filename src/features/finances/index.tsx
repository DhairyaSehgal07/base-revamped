import { getRouteApi } from "@tanstack/react-router"
import {
  BookOpen,
  FileSpreadsheet,
  Landmark,
  Receipt,
} from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { preserveScroll } from "@/lib/preserve-scroll"

import VoucherTab from "./components/voucher-tab/index"
import LedgerTab from "./components/ledger-tab/index"
import FinancialStatementTab from "./components/financial-statements-tab"
import ClosingBalanceTab from "./components/closing-balances-tab"
import type { FinancesTab } from "./search"

const financesRouteApi = getRouteApi("/_authenticated/finances/")

const FinancesPage = () => {
  const { tab } = financesRouteApi.useSearch()
  const navigate = financesRouteApi.useNavigate()

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as FinancesTab },
      ...preserveScroll,
    })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="vouchers">
            <Receipt className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Vouchers</span>
          </TabsTrigger>

          <TabsTrigger value="ledgers">
            <BookOpen className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Ledgers</span>
          </TabsTrigger>

          <TabsTrigger value="financial-statements">
            <FileSpreadsheet className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Financial Statements</span>
          </TabsTrigger>

          <TabsTrigger value="closing-balances">
            <Landmark className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Closing Balances</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="min-w-0">
          <VoucherTab/>
        </TabsContent>

        <TabsContent value="ledgers" className="min-w-0">
          <LedgerTab/>
        </TabsContent>

        <TabsContent value="financial-statements" className="min-w-0">
          <FinancialStatementTab/>
        </TabsContent>

        <TabsContent value="closing-balances" className="min-w-0">
          <ClosingBalanceTab/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancesPage
