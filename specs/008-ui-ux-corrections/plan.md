# Implementation Plan: Deshi Bazaar UI/UX & Functional Corrections (Round 7)

**Branch**: `008-ui-ux-corrections` | **Date**: 2026-11-03 | **Spec**: `specs/008-ui-ux-corrections/spec.md`

**Input**: Feature specification from `/specs/008-ui-ux-corrections/spec.md`

## Summary

Fix the 8-point UI/UX and functional correction list for the Deshi Bazaar single-file web app: clean header icons + Dark/Light toggle, readable product cards with a visible RMB OFF tag, collapsible left-sidebar shop filters, a working **Confirm Order** action (replacing the WeChat copy flow), a fixed A4 print receipt with Download button, a slim footer with small WA/WeChat icons next to the hotline, and an enriched Admin Customers tab — then push to `Deshi_Bazaar` and update the mother-repo submodule pointer.

## Technical Context

**Language/Version**: Vanilla JS (ES2020), single-file HTML app; Node (any modern) only for `node --check` validation. No transpilation.

**Primary Dependencies**: None at runtime (no framework, no CDN libs). `ui-ux-pro-max` + `impeccable` applied by Zara for design QA.

**Storage**: Browser `localStorage` — keys: `db-theme` (`light`|`dark`|`system`), existing order/cart/user stores (unchanged schema + new fields `o.confirmed`, `u.ts`, `u.blocked`).

**Testing**: No browser available (Playwright missing `libnspr4.so`). Verification = (1) extract `<script>` → `node --check`; (2) static grep markers (brand constants, zero "Albar", zero `wechatsend` in done screen, one `data-act="acctmenu"` in header); (3) logic review of new handlers.

**Target Platform**: Desktop + mobile web (320px–1440px), GitHub Pages.

**Project Structure**: Single canonical file — `projects/deshi-bazaar/index.html` (~2000+ lines). All edits go here. NEVER touch `/mnt/f/...`.

## Constitution Check (GATE)

Project has no adopted `.specify/memory/constitution.md` (template placeholder only). Skipping the heavyweight gate; applying project rules from AGENTS.md instead:

- ✅ All changes inside `projects/deshi-bazaar/index.html` (single-file app).
- ✅ Zero "Albar" brand leaks; brand constants preserved.
- ✅ No new runtime dependencies, no build step.
- ✅ Human-in-the-loop: no commit/push without explicit user approval (point 8 pre-approves push once spec+plan approved).
- ✅ Verification before push (node --check + grep markers).

## Technical Decisions

### 1. Theme system (US3)
- **Decision**: Keep the existing round-6/7 theme infra. `A.theme` cycles `light → dark → system`; `applyTheme()` sets `data-theme` on `<html>` and writes `localStorage['db-theme']`; themeInit IIFE applies before first render.
- **Rationale**: Already coded and consistent with `:root[data-theme=light]` / `:root[data-theme=dark]` palettes (~line 75) and the base `prefers-color-scheme` block (~line 20).
- **Remaining**: Swap the current 🌏 glyph for ☀️ (light) / 🌙 (dark) / 🌗 (system) in `updateThemeIcon()`.

### 2. Header icons (US3)
- **Decision**: Icons declared exactly once in inline header markup — `.icorow` with giftIco 🎁 → themeIco → acctIco (tier-ring) → cartpill. Old duplicate injections removed; safety-net IIFE kept.
- **Rationale**: Single source of truth avoids the round-3/round-5 duplicate-injection bug.

### 3. Product card (US4)
- **Decision**: Card CSS (~line 165–190) rewritten for line-height/spacing/contrast in both themes; zig-zag `.off` tag unified to `var(--red)`, top-left; `.feat-badge` single-position (`top:8px;left:8px;margin-top:30px`).
- **Rationale**: Fixes overlap + makes the discount tag visible.

### 4. Shop sidebar (US5)
- **Decision**: `V.shop` = `.wrap.shopwrap` grid (sidebar + main). Sidebar `.sbside` has three collapsible groups (Price / Category / Brand) via `.sbgrp` header + `.sbcon[data-g]` body. Top chip row keeps only status filters. Mobile (<1000px): sidebar off-canvas behind `.sbtog` "Filters" button.
- **Rationale**: Matches the requested layout; grid gains width on desktop.
- **Remaining code**: `A.sbtog`, `A.sbgrp` handlers (expand/collapse + arrow rotation), `.sbtog`/`.sbcon`/`.sbarr` CSS (hidden state, transform, off-canvas media query), grid-width bump.

### 5. Confirm Order (US1)
- **Decision**: Replace the `data-act="wechatsend"` gold button in `V.done` with `data-act="confirmorder"`. Handler stamps `o.confirmed = Date.now()`, keeps `status: 'Payment Pending'`, `save()`, toast "Order confirmed", re-renders done screen as disabled "Confirmed ✓" state. Admin order card (~line 1973 `ordCard` patch) shows "Customer confirmed" when `o.confirmed` present.
- **Rationale**: Orders already get `status:'Payment Pending'` at creation (~line 1278); the new field is the customer-acknowledgment signal Admin needs.
- **Edge**: re-tap is a no-op (button disabled after confirm); save failure → error toast, no false success.

### 6. Print receipt (US2)
- **Decision**: Rewrite `@media print` (~line 472): `@page { size: A4; margin: 12mm }`; hide header/nav/footer/buttons/site chrome via `body *{visibility:hidden}` + `#receipt, #receipt *{visibility:visible}` pattern (or display-based hiding with the receipt node repositioned to `position:absolute; inset:0`). Add **Download Receipt** button in `rActions`/`openReceipt` that calls `window.print()` (browser "Save as PDF" is the download path — no server-side PDF).
- **Rationale**: Guarantees only the receipt prints, on a clean A4, regardless of what screen state the app is in.

### 7. Footer (US6)
- **Decision**: Remove the large WA/WeChat buttons from `function foot()` (~line 759). Render the hotline line as `Hotline: +8618551702750` followed by two small icon links (WA `wa.me/8618551702750`, WeChat deep link) at ~18px, inline, muted.
- **Rationale**: Small icons beside the number are the requested design; icons render only if the number is configured.

### 8. Admin Customers tab (US7)
- **Decision**: `custHTML()` (~line 2073) adds columns: Join Date (`u.ts`), Total Orders (count from orders by phone), Last Order Date (max `o.ts` or "—"), Account Status (Active/Blocked from `u.blocked`). Keep Edit + Reset PW actions.
- **Data change**: At registration (~line 1603, `u={phone:ph,nick:nk,h:hsh(pw)}`) add `ts: Date.now()`; `blocked` defaults falsy. Legacy users without `ts` render "—".
- **Rationale**: Minimal schema add, backward-compatible with existing localStorage users.

## Key Changes

| # | Action (File/Class) | Purpose | User Story |
|---|---------------------|---------|------------|
| 1 | `index.html` — `updateThemeIcon()` glyph swap (☀️/🌙/🌗) | Visible theme state | US3 |
| 2 | `index.html` — `A.sbtog`, `A.sbgrp` handlers + `.sbtog/.sbcon/.sbarr` CSS + grid-width bump | Working collapsible sidebar, mobile toggle | US5 |
| 3 | `index.html` — `V.done` (remove wechatsend, add confirmorder) + `A.confirmorder` + `ordCard` marker | Confirm Order flow | US1 |
| 4 | `index.html` — `@media print` rewrite + Download Receipt button in `rActions` | Clean A4 receipt | US2 |
| 5 | `index.html` — `function foot()` (small icons beside hotline, remove big buttons) | Footer redesign | US6 |
| 6 | `index.html` — `custHTML()` new columns + registration `ts`/`blocked` fields | Admin Customers tab | US7 |
| 7 | `index.html` — verify card CSS + `.off` tag (already coded, verify only) | Card readability | US4 |
| 8 | Git: submodule commit + push → mother-repo pointer bump + push → live marker check | Ship | All |

## Phases

### Phase 1: Foundation / already-coded verification (mostly done pre-gate)
- **1.1** Verify header `.icorow` single-declaration + safety-net IIFE (done pre-gate; verify with grep).
- **1.2** Verify theme palettes `:root[data-theme=light]` / `[data-theme=dark]` have all vars (`--hero1/2`, `--sc-*`).
- **1.3** Swap theme icon glyphs to ☀️/🌙/🌗.
- **1.4** Verify product-card CSS + `.off` tag + `.feat-badge` positions.

### Phase 2: Core features
- **2.1** Sidebar JS (`A.sbtog`, `A.sbgrp`) + CSS (hidden states, arrow, off-canvas) + grid width.
- **2.2** Confirm Order: `V.done` button swap, `A.confirmorder`, `ordCard` "Customer confirmed" marker.
- **2.3** Print CSS rewrite (A4) + Download Receipt button.

### Phase 3: Polish & admin
- **3.1** Footer redesign (small icons, hotline).
- **3.2** Customers tab columns + registration `ts`/`blocked`.

### Phase 4: Verification & ship
- **4.1** Extract `<script>` → `node --check`.
- **4.2** Grep markers: `Albar`=0, `wechatsend` absent from done screen, hotline/address/brand constants present, one `data-act="acctmenu"` in header.
- **4.3** `impeccable` design pass (Zara) on changed screens.
- **4.4** Commit in `projects/deshi-bazaar` → `git push origin main` (remote `Deshi_Bazaar.git`) → update mother-repo submodule pointer → commit + push `Albar-Ai_Agency-HQ` (longer push timeout; run pushes separately from `sync_approved.sh`).
- **4.5** Live marker check at `https://aiclhq.github.io/Deshi_Bazaar/index.html` (use `/index.html`, not root — root serves stale cache).
- **4.6** Write round-7 report in `reports/daily/` per daily reporting protocol.

## Complexity Tracking

No rule violations expected — single-file, no new dependencies, no API surface changes. If `node --check` fails or a brand constant regresses, stop and fix before push (no waiver path; not an architecture question).
