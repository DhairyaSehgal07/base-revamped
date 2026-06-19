# Changelog

All notable changes to this project are documented in this file.

## [0.3.0] - 2026-06-19

Daybook wired to live gate-pass data with search and filters, plus people registration and profile improvements.

### Added
- Daybook list and search API hooks with URL-driven pagination, type filter (all/incoming/outgoing), sort order, and search-by field (gate pass, manual parchi, marka, remarks).
- Incoming and outgoing gate pass cards with expandable detail, ERP-style numeric formatting, and loading skeletons.
- Daybook search domain layer (`search.ts`, `types.ts`, `format.ts`) and debounced receipt-number input hook.
- Farmer profile page at `/people/:id` with cost-per-bag display and contact details from route search params.
- Shared `SettingsBackButton` on Profile and Preferences pages for navigation back to Settings.

### Changed
- Daybook page rebuilt from placeholder tab to live paginated list with refresh, error, and empty states.
- Post-login, sidebar, and finances-disabled redirects now use shared `DEFAULT_DAYBOOK_SEARCH` params.
- Quick-register farmer API aligned to `/farmer-storage-link/quick-register-farmer` response shape.
- Add farmer form: optional account number (auto-assign when blank), name/address length validation, and finance fields hidden when `showFinances` preference is off.
- People list toolbar simplified; farmer cards pass `costPerBag` to the profile route.
- Farmer and storage-link types extended for quick-register payload and response.

### Removed
- Placeholder `incoming-tab` daybook component and generic `person-detail-page` in favor of the new daybook and farmer profile implementations.

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
