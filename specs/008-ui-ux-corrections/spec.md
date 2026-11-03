# Feature Specification: Deshi Bazaar UI/UX & Functional Corrections

**Feature Branch**: `008-ui-ux-corrections`
**Created**: 2026-11-03
**Status**: Draft — ready for review
**Input**: User description: "Implement the 8-part UI/UX correction list for Deshi Bazaar: 1. Fix header duplicate icons & add Dark/Light mode. 2. Fix product card text visibility. 3. Move categories to a collapsible left sidebar. 4. Replace WeChat button with Confirm Order button. 5. Fix print receipt CSS. 6. Redesign footer with icons next to hotline. 7. Fix Admin Members tab. 8. Push to GitHub."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Customer can confirm the order and Admin sees the status (Priority: P1)

After checkout, the customer lands on the "Order ready to send" screen. Instead of being told to copy a message and send it via WeChat, the customer sees an active **Confirm Order** button. Tapping it marks the order as confirmed / "Payment Pending" and updates the status the Admin sees.

**Why this priority**: This is the revenue path. The old WeChat copy flow is broken and the Admin has no clear signal that a customer confirmed. Fixing it directly affects order conversion.

**Independent Test**: Place an order in the app, land on the done screen, tap **Confirm Order**, verify the order status in Admin becomes/keeps `Payment Pending` with a `confirmed` timestamp. No WeChat copy button is present.

**Acceptance Scenarios**:
1. **Given** a customer has placed an order, **When** they land on the "Order ready to send" screen, **Then** there is no "WeChat: copy & send" button and a primary **Confirm Order** button is visible.
2. **Given** the order is unconfirmed, **When** the customer taps **Confirm Order**, **Then** the order is stamped with a `confirmed` timestamp, status remains `Payment Pending`, `localStorage` is saved, and a toast confirms the action.
3. **Given** an Admin opens the order card, **When** the customer has confirmed, **Then** the order card shows a "Customer confirmed" marker or equivalent.

---

### User Story 2 — Customer can print / download a clean A4 receipt (Priority: P1)

From the receipt / voucher view, the customer can tap **Print / Download** and get a clean single A4 page containing only the receipt — no site chrome, no navigation, no buttons, no background.

**Why this priority**: The current print output is broken/blank, which blocks a core post-purchase action.

**Independent Test**: Open a receipt, trigger print (or Download), verify the browser's print preview shows only the receipt on a single A4 page with no app UI.

**Acceptance Scenarios**:
1. **Given** the receipt modal is open, **When** the user clicks Print / Download Receipt, **Then** `window.print()` is called and the `@media print` CSS hides the header, nav, footer, buttons, and background.
2. **Given** the print CSS is active, **When** the browser renders the page, **Then** the receipt is the only visible content, full-width on a single A4 page.

---

### User Story 3 — Header is clean with a working Dark/Light toggle (Priority: P1)

The header shows exactly one User Profile icon, one Gift icon, one Theme toggle, and the cart — no duplicate or blank circle. A Sun/Moon icon toggles Dark/Light mode, persists the choice to `localStorage`, and applies it via `data-theme` on `<html>`.

**Why this priority**: The duplicate/blank icon looks broken on first impression, and the theme toggle was explicitly requested.

**Independent Test**: Load the site and verify the header icon row shows Gift → Theme → User → Cart with exactly one User icon. Tap the theme icon and verify `data-theme` toggles and `localStorage['db-theme']` is set. Reload and verify the theme persists.

**Acceptance Scenarios**:
1. **Given** the app loads, **When** the header renders, **Then** there is exactly one User Profile icon and no duplicate/blank circle.
2. **Given** the current theme is `light`, **When** the user taps the theme icon, **Then** `data-theme="dark"` is set on `<html>` and the palette switches.
3. **Given** the user toggles the theme, **When** they reload the page, **Then** the theme is restored from `localStorage['db-theme']`.

---

### User Story 4 — Product cards are readable with a visible RMB OFF tag (Priority: P2)

On every product card, the Category, English name, Bangla name, Size, and Stock label are clearly readable with proper contrast and spacing in both Light and Dark modes. The red "RMB OFF" zig-zag tag is clearly visible in the top-left of discounted products.

**Why this priority**: Overlapping card text undermines trust and makes the shop feel broken.

**Independent Test**: Open the shop and inspect product cards in Light and Dark mode at 320px and 1280px widths. Verify no text overlaps the image or each other, and the RMB OFF tag is visible top-left on discounted items.

**Acceptance Scenarios**:
1. **Given** a product card renders, **When** it is viewed in Light or Dark mode, **Then** Category, Name, Bangla name, Size, and Stock are legible with no overlap.
2. **Given** a product has an `old` price higher than `price`, **When** the card renders, **Then** a red zig-zag "RMB OFF" tag is visible in the top-left.
3. **Given** the card image and text, **When** the card is at 320px viewport width, **Then** text wraps and does not overlap the image area.

---

### User Story 5 — Shop page uses a collapsible left sidebar for categories (Priority: P2)

On the Shop page, the product category filters (Rice, Snacks, Masala, etc.) move from horizontal top chips into a left sidebar. The sidebar groups are collapsible (Price, Category, Brand) and the product grid gains more horizontal space.

**Why this priority**: The top chip row is cramped and the grid is squeezed. A sidebar matches the requested layout and gives the grid breathing room.

**Independent Test**: Open the Shop page on a desktop (≥1000px) and verify categories are in a left sidebar with collapsible groups. Toggle a group open/closed. On mobile (<1000px), verify the sidebar is hidden behind a "Filters" toggle.

**Acceptance Scenarios**:
1. **Given** the Shop page on desktop, **When** it renders, **Then** category filters appear in a left sidebar and the product grid uses the remaining width.
2. **Given** a sidebar group header (Price / Category / Brand), **When** the user taps it, **Then** the group expands/collapses and the arrow rotates.
3. **Given** the Shop page on mobile (<1000px), **When** the user taps the "Filters" toggle, **Then** the sidebar slides in/out over the content.

---

### User Story 6 — Footer shows small WA + WeChat icons beside the hotline (Priority: P3)

The footer no longer has large WhatsApp / WeChat buttons. Instead, small WA and WeChat icons appear directly next to `Hotline: +8618551702750`.

**Why this priority**: The large buttons are visually noisy; inline icons are the requested design.

**Independent Test**: Scroll to the footer and verify there are no large WA/WeChat buttons, and small icons sit next to the hotline number.

**Acceptance Scenarios**:
1. **Given** the footer renders, **When** the user scrolls to it, **Then** there are no large WhatsApp or WeChat buttons.
2. **Given** the footer hotline line, **When** it renders, **Then** small WA and WeChat icons are displayed immediately after `Hotline: +8618551702750`.

---

### User Story 7 — Admin Customers tab shows full member details (Priority: P3)

The Admin Customers tab table includes columns for Join Date, Total Orders, Last Order Date, and Account Status (Active/Blocked), while keeping the Edit and Reset PW actions.

**Why this priority**: The Admin needs lifecycle data (join date, order count, last order, status) to manage customers.

**Independent Test**: Log in as Admin, open the Customers tab, and verify the table has the four new columns plus Edit / Reset PW for each row.

**Acceptance Scenarios**:
1. **Given** an Admin opens the Customers tab, **When** the table renders, **Then** each row shows Join Date, Total Orders, Last Order Date, and Account Status.
2. **Given** a customer has placed orders, **When** the row renders, **Then** Total Orders reflects the count and Last Order Date reflects the most recent order.
3. **Given** an Admin has Edit and Reset PW, **When** the table renders, **Then** both actions are still present per row.

---

### Edge Cases

- **Theme toggle**: What if `localStorage` is unavailable (private mode)? → Fall back to system preference and don't crash.
- **Theme toggle**: What if the user toggles rapidly? → Each tap applies the next state idempotently; no flash.
- **Confirm Order**: What if the order is already confirmed? → The button becomes disabled or shows "Confirmed" and re-tapping is a no-op.
- **Confirm Order**: What if `localStorage` save fails? → Show an error toast; do not claim success.
- **Print receipt**: What if the user is on a device without a printer? → The browser's "Save as PDF" path still works via the same `@media print` CSS.
- **Print receipt**: What if the receipt modal is closed? → The print CSS still hides app chrome; only the receipt node is targeted.
- **Sidebar**: What if there are zero brands or zero categories? → Show a "No brands listed" / empty state, not a broken layout.
- **Sidebar**: What if the viewport resizes across the 1000px breakpoint? → The sidebar toggles between off-canvas (mobile) and inline (desktop) without losing filter state.
- **Admin Customers**: What if a customer has never ordered? → Total Orders = 0, Last Order Date = "—".
- **Admin Customers**: What if a customer is blocked? → Account Status shows "Blocked" and the row is visually distinguishable.
- **Footer icons**: What if the WA/WeChat numbers are missing from settings? → Show the icons only if the corresponding number is configured.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show exactly one User Profile icon in the header, in the order Gift → Theme → User → Cart, with no duplicate or blank circle.
- **FR-002**: System MUST provide a Dark/Light mode toggle (Sun/Moon) in the header that sets `data-theme` on `<html>` and persists to `localStorage['db-theme']`.
- **FR-003**: System MUST apply the saved theme on page load before first paint to avoid a flash of the wrong theme.
- **FR-004**: Product cards MUST display Category, English name, Bangla name, Size, and Stock status with no text overlap in Light and Dark modes at 320px–1440px.
- **FR-005**: Discounted products MUST show a red zig-zag "RMB OFF" tag in the top-left of the card.
- **FR-006**: The Shop page MUST render category filters in a left sidebar with collapsible Price / Category / Brand groups.
- **FR-007**: The product grid MUST gain horizontal space when the sidebar is present (desktop) and the sidebar MUST be toggleable on mobile.
- **FR-008**: The "Order ready to send" screen MUST NOT show a "WeChat: copy & send" button.
- **FR-009**: The "Order ready to send" screen MUST show an active **Confirm Order** button that stamps the order with a `confirmed` timestamp, keeps status `Payment Pending`, saves to `localStorage`, and shows a toast.
- **FR-010**: The Admin order card MUST reflect that the customer confirmed the order (e.g., a "Customer confirmed" marker).
- **FR-011**: The receipt print CSS MUST hide all app chrome (header, nav, footer, buttons, background) and print only the receipt on a single A4 page (`@page { size: A4 }`).
- **FR-012**: The receipt view MUST include a **Download Receipt** button that triggers the clean print view.
- **FR-013**: The footer MUST NOT contain large WhatsApp / WeChat buttons.
- **FR-014**: The footer MUST show small WA and WeChat icons directly next to `Hotline: +8618551702750`.
- **FR-015**: The Admin Customers tab MUST include columns: Join Date, Total Orders, Last Order Date, Account Status (Active/Blocked).
- **FR-016**: The Admin Customers tab MUST keep the Edit and Reset PW actions.
- **FR-017**: All changes MUST be made in `projects/deshi-bazaar/index.html` (single-file app); no new build step, no new runtime dependencies.
- **FR-018**: The implementation MUST keep the brand constants: "Deshi Bazaar (দেশি বাজার)", address "Pukuo District, Nanjing City, Jiangsu Province - 210044, P.R. China", hotline "+8618551702750", and zero occurrences of "Albar".
- **FR-019**: The completed feature MUST be committed and pushed to the `Deshi_Bazaar` repository, and the `Albar-Ai_Agency-HQ` submodule pointer MUST be updated.

### Key Entities

- **Order**: has `no`, `ts`, `status` (`Payment Pending`), `cust`, `total`, and a new optional `confirmed` timestamp.
- **User (S.users)**: has `phone`, `nick`, `h`, and new optional `ts` (join date) and `blocked` (boolean) fields.
- **Theme preference**: stored as `localStorage['db-theme']` with values `light`, `dark`, or `system`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The header contains exactly one User Profile icon (verified by DOM inspection / grep for `data-act="acctmenu"` count = 1 in header markup).
- **SC-002**: Tapping the theme icon toggles `data-theme` and the choice persists across reloads (verified by reloading and checking `<html data-theme>`).
- **SC-003**: Product cards show zero overlapping text lines in Light and Dark mode at 320px and 1280px (verified by visual inspection / screenshot).
- **SC-004**: The RMB OFF zig-zag tag is visible in the top-left on at least one discounted product (verified by grep for `.off` + visual).
- **SC-005**: The Shop page categories are in a left sidebar on desktop and the grid uses the remaining width (verified by layout inspection).
- **SC-006**: The "Order ready to send" screen has zero "WeChat: copy & send" buttons and one **Confirm Order** button (verified by grep).
- **SC-007**: Tapping **Confirm Order** sets `o.confirmed` and saves (verified by reading `localStorage` order state).
- **SC-008**: The browser print preview of a receipt shows only the receipt on a single A4 page with no app chrome (verified by print preview).
- **SC-009**: The footer has zero large WA/WeChat buttons and small icons next to the hotline (verified by visual / grep).
- **SC-010**: The Admin Customers tab shows Join Date, Total Orders, Last Order Date, Account Status, Edit, and Reset PW (verified by table inspection).
- **SC-011**: The live site at `https://aiclhq.github.io/Deshi_Bazaar/index.html` passes all marker checks (brand constants, hotline, address, zero "Albar", and the new UI markers).

## Assumptions

- The app is a single-file vanilla JS/CSS/HTML application with no build step; all edits go into `index.html`.
- `localStorage` is available for theme preference and order state; private-mode fallback is system theme.
- The existing order creation already sets `status: 'Payment Pending'`; **Confirm Order** adds a `confirmed` timestamp and a customer-side acknowledgment rather than changing the status string.
- The Admin auth model is unchanged; the Customers tab is only reachable by an authenticated Admin.
- The theme icon uses Sun (☀️) / Moon (🌙) glyphs or equivalent; the exact glyph is an implementation detail.
- The 1000px breakpoint for the sidebar is reused from the existing `.shopwrap` media query.
- Brand constants (name, address, hotline) are already present in the footer/about and must not regress.
- The "Download Receipt" button triggers `window.print()`; the browser's "Save as PDF" is the download mechanism (no server-side PDF generation).
- Playwright / browser smoke tests are unavailable in the dev environment; verification is via `node --check` on the extracted script, static grep markers, and logic review.
