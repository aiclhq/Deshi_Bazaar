# Plan — Round 9: Shwapno-Based UI/UX Corrections

## Context
Continuing from Round 8, which researched Shwapno.com layout. This round implements the specific UI corrections aligned to Shwapno's design patterns, targeting `projects/deshi-bazaar/index.html`.

---

## 1. Research Findings

### Shwapno.com Layout Patterns (from codebase & prior research)
- **Header:** Right-aligned icon bar with search, cart, user profile, and theme controls in a tight horizontal row.
- **Category Navigation:** Left-side persistent sidebar listing all categories with icons. Collapsible on mobile (hamburger drawer). Always visible on desktop (>1000px).
- **Product Cards:** Clean card layout with:
  - Discount badge (RMB OFF) at top-left with zig-zag bottom edge
  - Category label (small, uppercase, muted color)
  - Product title (bold, good line-height)
  - Bangla name and size info below title with proper spacing
  - No text overlap with product image area

### Current Deshi Bazaar State
- **Header icons** (`.top .icorow`): Theme toggle and account icon present but alignment/ordering could be tighter (line 62-64, 583-584).
- **Profile modal** (`acctmenu` handler, line 2062-2071): Shows account tier info but has no "Log out" button or "Admin Panel" button.
- **Homepage categories** (line 795-796): Renders a `<div class="cats">` grid — full-width buttons with gradient backgrounds. Not a sidebar.
- **Shop page sidebar** (line 836-847): Already has a `.sbside` sidebar with filters (price, category, brand) — collapsible on mobile, persistent on desktop. This is the closest to Shwapno's sidebar but it's only on the shop page, not the homepage.
- **Product card** (line 757-762): RMB OFF tag with zig-zag CSS already exists (line 172-173). Text body (`.c-body`) has `gap:3px` and items include category, title, Bangla name, size — potential overlap risk with long Bangla text.

---

## 2. Changes to Make

### Fix 1: Header — Tighten Icon Row Alignment
**File:** `index.html` (CSS lines ~62-70, header markup ~568-590)

- Ensure `.top .icorow` uses proper `gap` and `align-items: center`
- Order: Gift icon → Theme toggle → Cart pill → Account icon (tier ring)
- On mobile (<560px): Reduce icon/button sizes consistently

**Current code (line 62-64):**
```css
.top .icorow{display:flex;align-items:center;gap:6px;margin-left:auto}
.top .icorow .ib{order:1}
.top .icorow .cartpill{order:2}
```

**Change:** Keep as-is if alignment is already correct. The CSS looks solid. Verify no visual gap issues.

### Fix 2: Profile Sheet — Add "Log out" and "Admin Panel" Buttons
**File:** `index.html` (`acctmenu` handler, line 2062-2071)

- Add a "Log out" button at the bottom of the account sheet
- Conditionally show "Admin Panel" button when user is admin (`adminOK === true`)
- If already admin, show "Admin Logout" instead

**Current button area (line 2070):**
```js
'<div class="actions"><button class="btn" data-act="go" data-v="me">My account</button><button class="btn ghost" data-act="close">Close</button></div>';
```

**Change to:**
```js
'<div class="actions" style="display:flex;flex-direction:column;gap:6px">'+
  '<div class="actions"><button class="btn" data-act="go" data-v="me">My account</button><button class="btn ghost" data-act="close">Close</button></div>'+
  (u?'<button class="btn ghost" style="color:var(--red);border-color:var(--red)" data-act="logout">Log out</button>':'')+
  (adminOK?'<button class="btn" style="--btn:var(--gold)" data-act="go" data-v="admin">Admin Panel</button>':'')+
  (u&&adminOK?'<button class="btn ghost" style="color:var(--red);border-color:var(--red)" data-act="adminlogout">Admin Logout</button>':'')+
'</div>';
```

**Add handler** in `A` object:
```js
logout: function(){ /* clear user, re-render */ },
adminlogout: function(){ adminOK=false; render(); toast('Admin session ended'); },
```

### Fix 3: Homepage — Replace Category Grid with Left Sidebar
**File:** `index.html` (homepage function, line 795-796, CSS lines 156-159)

- Remove the `<div class="cats">` grid from homepage (line 795-796)
- Add a persistent left sidebar on the homepage listing all categories with icons (Shwapno-style)
- The sidebar should be collapsible on mobile (hamburger/drawer) and persistent on desktop
- Reuse the existing `.sbside` / `.sbtog` / `.sbcon` infrastructure from the shop page

**Current homepage category section (line 795-796):**
```js
'<div class="wrap"><section class="sec"><div class="sec-h"><h2>Shop by category</h2></div><div class="cats">'+
  CATS.map(function(c){return '<button class="cat" ...>'+...+'</button>';}).join('')+'</div></section>'+
```

**Replace with:** A sidebar-wrapped homepage layout similar to shop page, with category list in the sidebar and main content in the grid area.

### Fix 4: Product Card — RMB OFF Tag (Already Implemented)
**Status:** Already present in code (line 172-173, 772). Zig-zag CSS via `clip-path` polygon. Verified working from Round 7.

**No changes needed.**

### Fix 5: Product Card — Text Spacing and Overlap Prevention
**File:** `index.html` (`.c-body` CSS line 176-178, card function line 757-762)

**Current CSS:**
```css
.c-body{padding:10px 12px 14px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.c-cat{font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.c-body h3{font-size:.96rem;font-weight:800;line-height:1.25;cursor:pointer;overflow-wrap:anywhere;word-break:break-word;color:var(--fg);margin:2px 0}
```

**Current card body HTML (line 762):**
```js
'<div class="c-body"><span class="c-cat">'+esc(catOf(p.cat).name)+'</span><h3 data-act="open" data-id="'+p.id+'">'+esc(title(p))+'</h3><p class="bn">'+esc(p.bn)+'</p><p class="szl">'+esc(p.size)+'</p>'+stp(p)+
```

**Changes:**
- Increase `.c-body` gap from `3px` to `4px`
- Add explicit `margin: 0` and `line-height` to `.bn` (Bangla name) and `.szl` (size) paragraphs
- Ensure `h3` has `max-height` or `line-clamp` for very long titles
- Add `padding-top` to `.c-body` to create more breathing room from image

```css
.c-body{padding:12px 12px 14px;display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.c-body h3{font-size:.96rem;font-weight:800;line-height:1.3;cursor:pointer;overflow-wrap:anywhere;word-break:break-word;color:var(--fg);margin:0}
.c-body h3{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bn{font-size:.88rem;color:var(--fg);margin:0;line-height:1.4;font-weight:600}
.szl{font-size:.8rem;color:var(--muted);margin:0;line-height:1.3}
```

---

## 3. Implementation Order

1. **Fix 2** — Profile sheet buttons (smallest change, isolated JS)
2. **Fix 5** — Product card text spacing (CSS-only change)
3. **Fix 3** — Homepage sidebar (larger structural change)
4. **Fix 1** — Header alignment (verify + minor CSS tweaks if needed)
5. **Fix 4** — Already done, no action needed

## 4. Acceptance Criteria

- [ ] Profile sheet shows "Log out" button when user is logged in
- [ ] Profile sheet shows "Admin Panel" button when `adminOK === true`
- [ ] "Log out" clears the current user session and re-renders
- [ ] Homepage displays left sidebar with all categories (Shwapno-style)
- [ ] Sidebar is collapsible on mobile, persistent on desktop
- [ ] Category grid (`.cats`) removed from homepage
- [ ] Product card text (Bangla name, English name, size) does not overlap image
- [ ] Product card text has consistent spacing and line-height
- [ ] Header icons remain properly aligned on all breakpoints
- [ ] All 37 existing Playwright checks still pass

## 5. Risks & Notes

- **Homepage sidebar (Fix 3)** is the largest change — it restructures the homepage layout. Must ensure existing sections (hero, featured, how ordering works, about) still render correctly.
- **Bangla text rendering** — `word-break: break-word` may cause awkward breaks. Consider `overflow-wrap: anywhere` as primary.
- **Reusability** — The shop page already has `.sbside` infrastructure. Homepage sidebar should share the same CSS classes for consistency.
- **Admin state** — `adminOK` is a simple boolean flag. Ensure logout/admin-logout handlers properly reset it.
