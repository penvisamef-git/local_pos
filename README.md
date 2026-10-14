# local_pos — POS screen in the shop

The sales screen for one counter. It talks only to **local_pos_api** on the same computer, so the shop keeps selling without internet; that server syncs with the cloud.

```
npm install
npm start          # development → http://localhost:3001 (calls REACT_APP_API_HOST, default http://localhost:8087)
npm run build      # production → local_pos_api serves the build at http://localhost:8087
```

**Colours** follow the admin web: *General settings → System theme* (24 themes; the 20 made from seeds are in `src/themeSeeds.js`, a copy of the admin's). The theme comes with the sync (every 5 min, or tap Sync) and is kept on this computer; the customer display follows it too (`src/theme.js`).

**My colours** (profile menu → My colours): each cashier can pick his own colours (21 choices, or "Shop colours" = follow the admin). Saved per cashier on this computer (`localStorage pos_theme_user_<id>`), applied when he logs in; the next cashier gets his own choice or the shop's colours. The customer display follows the colours on the POS screen (the theme key goes with every display message). Same in the Cloud POS.

Fonts (Khmer + Latin) are bundled (`@fontsource-variable/*`) so the screen looks right offline.

## Flow

1. **Link** (first start only) — type the 6-digit code from the admin web (*CONNECT → POS devices → Add POS*). The shop's products, prices, staff and settings are downloaded.
2. **Login** — tap your name, type your POS PIN (set in the admin web; 5 wrong PINs → wait 1 minute).
3. **Open shift** — count the cash float (USD + KHR).
4. **Sell**
   - Scan a barcode anywhere (scanner = fast keys + Enter), or search (F2) / tap a product; products with sizes / colours ask which one. Box barcodes add the box unit.
   - **Auto / Enter** switch in the search box (kept per POS computer): *Auto* = a scanned barcode or item code goes into the cart by itself, no Enter needed (scanners with or without Enter both work); *Enter* = scan or type, then press Enter. Searching by name works the same in both.
   - Cart: + / −, type the qty, change the unit (pcs ↔ box).
   - **Out of stock** (0 or less left, or more than the stock): the item shows *Out of stock*. A cashier needs a shop manager's PIN to sell it (asked when adding, + qty, or at Pay); a shop manager sells it directly. The sale keeps who allowed it.
   - **Discount** on the bill (% or $). A cashier needs a shop manager to approve with their PIN.
   - **Pay**: cash USD / KHR (quick amounts, change shown as *$ + ៛*), KHQR / ABA (reference no.), or split over several methods.
   - **Hold** (button next to Pay, or *F8*): customer still shopping? Park the cart with a name / note and serve the next customer. The gold **Held n** button opens the held carts → **Resume** puts it back in the cart (the cart on screen is held automatically first). Held carts are saved in the local database, so they survive a restart. A cashier's discount is not kept — re-add it with a manager PIN.
   - **Customer** (button in the cart): search by phone / name or add a new one (also offline) → loyalty points are earned on the sale and can pay part of it (*Use points* in Pay). **Promotions** set in the admin apply by themselves (shown per line and in the totals).
   - **Bakong KHQR**: picking a KHQR method with *Bakong KHQR with the amount* shows a QR with the exact amount (also on the customer display); when the customer pays, the sale completes by itself. Without the Bakong token in the cloud, check the payment and press Complete.
   - **Layaway**: Hold → tick *Layaway (deposit)* → the deposit goes into the drawer. Later: Held → **Pay the rest** (the deposit pays first), **+** for more deposit, or delete (shop manager: deposit back from the drawer, or kept by the shop).
   - The receipt prints at once (80 mm), *Enter* starts the next sale.
5. **My report** (menu) — sales of the day: total, invoices, items, discounts, payments, by hour, top items, last 7 days, shifts; pick another day; print an 80 mm summary. A cashier sees only their own sales; a shop manager sees all staff (or one person) and *by cashier*.
6. **Customer display** (menu) — opens `/display` in a new window: drag it to the second screen and press *Full screen*. It shows *Welcome* (shop, clock) → the items and the total (USD + ៛) → what was paid and the change → *Thank you* (20 s). Khmer + English together. Several displays can be open; a tablet works too if local_pos_api runs with `HOST=0.0.0.0`.
7. **Cash in / out** (menu) — money in / out of the drawer that is not a sale: expenses (ice, delivery …), money to the safe (shop manager), change brought in. It is in the shift report and the admin web.
8. **Exchange** — Refund dialog → *Exchange for other items*: no money back, the value becomes credit → scan the new items → Pay (the credit pays first; more credit than the new items = the rest as change). *Give cash instead* pays the credit out of the drawer.
9. **Refund / void** — Invoices → open an invoice → **Refund / void**: pick the items and how many (or *Void the whole invoice*), a reason, how the money goes back; a cashier needs a shop manager's PIN. A refund slip prints; stock goes back up; the shift's expected cash goes down. A partly refunded invoice can be refunded again (what is left).
10. **Invoices** (menu) — this shift's invoices, sent / waiting / problem, reprint. Tab **Not sent** (or tap the red bar at the bottom): invoices the cloud refused, from any shift, with the reason → **Try again** after fixing it in the admin, or **Remove** (reason + shop manager PIN) when it can never be sent; a removed invoice is kept here, never sent, and left out of totals.
11. **Close shift** (menu) — count the drawer → expected vs counted → shift report (Z) printed → log out.

Top bar: shop + shift, search, **Online / Offline** with the number of sales waiting to be sent (tap = sync now), user menu (invoices, close shift, language, unlink POS for managers, log out).

## Files

| File | |
|---|---|
| `src/App.jsx` | link → login → open shift → sell |
| `src/api.js` | calls `/api/pos/*` (token in `x-pos-token`, this tab only) |
| `src/cart.js` | preview of the totals / change (the server recalculates) |
| `src/screens/` | Pair, Login, OpenShift, Sell, PayDialog, DiscountDialog, Receipt (80 mm print), History, CloseShift, HoldDialog, Report, RefundDialog, CustomerDisplay (`src/display.css`) |
| `src/pos.css` | the whole look (touch first) + the receipt paper |

**Receipt style**: the admin picks one of 24 styles (POS devices → Receipt style); it comes with the sync as `setting.receipt_template` and `screens/Receipt.jsx` prints with it (`src/receiptTemplates.js`, `screens/receipt.css` — copies of the admin's).

**QR to scan**: a payment method with *Show a QR* switched on in the admin (`qr_image`) shows that QR big on the customer display while the cashier has it selected in Pay (with the amount due), and a small copy in the Pay dialog. local_pos_api keeps the QR picture inside the local data (data: URI, `keepQrOffline` in `src/sync.js`), so it also shows without internet. Same in the Cloud POS (the service worker caches the picture).
