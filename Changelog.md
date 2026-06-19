# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-06-19

Finances module expansion with full ledger and voucher management, client-side financial reporting, and supporting UI improvements.

### Added
- Ledger and voucher create, edit, and delete flows with confirmation dialogs and React Query mutations.
- Financial Statements tab with balance sheet and trading profit & loss views derived from ledger and voucher data.
- Closing Balances tab grouped by ledger type with balance sheet summary totals.
- Per-ledger statement page at `/finances/ledgers/:id` with period-scoped running balances.
- Finances domain layer for ledger classification, balance computation, and report assembly (with unit tests).
- Shared finances utilities for chart of accounts, currency formatting, and report date ranges.
- Period filter (today, this week, this month, this year, all time) on report tabs via URL search params.
- `AlertDialog` UI component for destructive confirmations.

### Changed
- Ledger and voucher tables wired to live API data with row actions, improved columns, and ERP-style numeric formatting.
- Add/edit ledger and voucher forms aligned with updated schemas, combobox search, and calendar date picking.
- Finances page tab layout with mobile-friendly icons and report context provider.
- Topbar title resolution for ledger detail routes.
- Searchable combobox and calendar components refined for form use in data-entry flows.
- Incoming and transfer-stock form schemas adjusted for consistency with shared validation patterns.
- TypeScript config paths updated for finances feature modules.
- Dependency bumps: `@tanstack/react-router`, `lucide-react`, and `@babel/core`.

## [0.1.0] - 2026-06-17

This is the first stable ERP release for the Kapur Cold Storage frontend.

### Added
- Stable authenticated application shell with sidebar and topbar navigation.
- Route support for Daybook, Incoming, Storage, Grading, Transfer, Analytics, People, Finances, and Settings.
- Centralized auth session stores for login state, preferences, cold storage context, and store admin context.
- Session lifecycle helpers for login/logout state persistence and cleanup.

### Changed
- Daybook feature structure updated to route-driven tabs and improved page composition.
- Form flows for incoming and storage operations aligned with shared API client and router context behavior.
- Environment, provider, and API client wiring refined for reliable authenticated navigation and data access.

### Notes
- Version `0.1.0` is marked as the first stable baseline for future incremental releases.
