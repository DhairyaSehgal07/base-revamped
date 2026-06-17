# Changelog

All notable changes to this project are documented in this file.

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
