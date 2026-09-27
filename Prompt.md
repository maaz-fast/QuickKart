# QuickKart — Admin Payments Page UI Polish Prompt

**Target file:** `frontend/src/pages/AdminPayments.jsx` (or equivalent, per the Safepay integration prompt).

## 1. Fix the search bar's black border
The search input currently has a solid black/dark outline that stands out harshly against the rest of the page's soft neutral-gray borders (visible on the stat cards, table, and dropdowns). Replace it with the same `--color-border` token used everywhere else, and apply the standard accent-gold focus ring on focus/click (consistent with the design-system prompt's form input guidance) rather than a permanent dark border. The search icon and placeholder text should stay muted gray; only the border and focus state need fixing.

## 2. Fix inconsistent stat-icon chip colors
The four icon chips (dollar sign, checkmark, clock, card) currently use four unrelated colors — gold, green, orange, and purple — with no clear logic. Standardize using the same convention established on the Dashboard:
- **Total Revenue Paid** → accent gold chip (primary metric)
- **Successful Payments** → success green chip (already correct, keep)
- **Pending Payments** → warm amber/gold chip, distinct enough from "Total Revenue" but still in the warm family since it's an "attention" state (avoid orange that clashes with the gold accent — pick one warm tone and use it consistently across the whole app for "pending/attention" states, matching the Order Status donut convention from the Dashboard)
- **Avg. Order Value** → neutral gray-brown chip instead of purple, since purple doesn't appear anywhere else in the app's palette and introduces a fifth unrelated hue

## 3. Elevate the stat cards to match the Dashboard's KPI cards
Right now these four stats sit as plain inline text blocks with no card container, while the Dashboard's KPI cards use bordered/shadowed cards. Bring this page in line: wrap each stat in the same card style (background, border, radius, shadow) used on `AdminDashboard.jsx`'s KPI cards, so the two pages feel like the same product. Add the same small trend-context treatment where meaningful (e.g., "vs last period") once there's enough transaction data for it to be meaningful — with zero data currently, a plain "—" or omitted trend line is fine rather than showing a fake 0% change.

## 4. Improve the empty table state
"No payment transactions found." currently sits as plain centered gray text with a lot of surrounding empty space. Replace with a proper empty state: a small muted icon (e.g., a receipt or card icon) above the text, the message itself, and optionally a secondary line suggesting next steps (e.g., "Transactions will appear here once customers complete checkout"). This matches the more considered empty-state treatment already recommended for the Dashboard's sparse charts.

## 5. Search + filter row polish
- Give the "Search" button the same primary-button treatment used elsewhere (solid accent gold, consistent radius/padding) — it already looks close, just confirm consistency.
- The "All Statuses" / "All Methods" dropdowns should match the search input's border/radius exactly — check for any mismatch in corner radius or border color between the three controls in that row, they should read as one connected control group, not three separately-styled elements.

## 6. Table header treatment
Column headers (DATE, ORDER ID, CUSTOMER, etc.) are currently plain uppercase gray text with no visual separation from the row area below. Add a subtle bottom border or very light background tint to the header row, consistent with how `AdminOrderList.jsx`/other admin tables in the app already style their headers (match existing convention rather than introducing a new one just for this page).

## Acceptance Check
- No harsh black borders anywhere on the page — every input/border uses the shared `--color-border` token with gold focus rings.
- All four stat-icon chips use colors that also appear elsewhere in the app's established palette — no one-off purple or orange introduced only on this page.
- This page's stat cards are visually indistinguishable in style (just different data) from the Dashboard's KPI cards.