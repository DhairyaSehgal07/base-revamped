import type { Voucher } from "@/features/finances/components/voucher-tab/types"
import type { VoucherApiRecord } from "@/features/finances/types"

export function mapVoucherToRow(voucher: VoucherApiRecord): Voucher {
  return {
    id: voucher._id,
    voucherNo: String(voucher.voucherNumber ?? ""),
    date: voucher.date,
    debit: voucher.debitLedger?.name ?? "",
    credit: voucher.creditLedger?.name ?? "",
    debitLedgerId: voucher.debitLedger?._id,
    creditLedgerId: voucher.creditLedger?._id,
    amount: voucher.amount ?? 0,
    narration: voucher.narration ?? "",
  }
}
