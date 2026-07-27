# Sauce Demo Playwright Suite

End-to-end automation for [Sauce Demo](https://www.saucedemo.com/) using **Playwright**, **TypeScript**, and the **Page Object Model**. The suite covers happy-path flows (auth, inventory, checkout) plus negative / defect-characterization tests for `problem_user`.

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- Network access to `https://www.saucedemo.com`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browser binaries (Chromium is enough for the default config)
npx playwright install chromium

# Optional: install OS dependencies on Linux CI agents
# npx playwright install-deps chromium
```

## Running tests

```bash
# Headless (default) — full suite
npm test

# Headed browser
npm run test:headed

# Playwright UI mode (explore, time-travel, watch)
npm run test:ui

# Step-through debugger
npm run test:debug

# Open the last HTML report
npm run report
```

Run by feature:

```bash
npm run test:auth
npm run test:inventory
npm run test:checkout
npm run test:problem-user
```

Or target a file directly:

```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/inventory.spec.ts
npx playwright test tests/checkout.spec.ts
npx playwright test tests/problem-user.spec.ts
```

## Project structure

```text
sauce-demo-playwright/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .gitignore
├── README.md
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/
│   ├── auth.fixture.ts      # Page objects + authenticatedInventory / problemUserInventory
│   └── test-data.ts         # Shared credentials, products, checkout data
└── tests/
    ├── auth.setup.ts        # Writes storageState for standard_user
    ├── auth.spec.ts         # Login success / failure cases
    ├── inventory.spec.ts    # Catalog, sort, cart badge
    ├── checkout.spec.ts     # Purchase flow + cart/checkout validation
    └── problem-user.spec.ts # Negative tests for known problem_user defects
```

| Area | Responsibility |
| --- | --- |
| `pages/` | Page Object Model — locators and user actions |
| `fixtures/` | Shared test data, page wiring, auth entry points |
| `tests/` | Specs by feature (`auth`, `inventory`, `checkout`, `problem-user`) |

## Test cases

Each row maps a documented test case to the Playwright title in the suite so coverage is easy to audit.

### Authentication — `tests/auth.spec.ts`

| ID | Test case | Playwright test | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-AUTH-01 | Successful login | `successful login with standard_user lands on inventory` | Open login → enter `standard_user` / `secret_sauce` → Login | Inventory page loads (`/inventory.html`, “Products” visible) |
| TC-AUTH-02 | Locked-out user | `locked out user shows the correct error message` | Login as `locked_out_user` | Error: user has been locked out; URL stays off inventory |
| TC-AUTH-03 | Invalid credentials | `invalid username/password shows the correct error message` | Login with bad username/password | Error: credentials do not match any user |

### Inventory — `tests/inventory.spec.ts`

| ID | Test case | Playwright test | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-INV-01 | Product catalog visible | `product list is visible and contains expected items` | Authenticate → open inventory | All 6 expected product names are listed |
| TC-INV-02 | Product sorting | `sorting works for name and price options` | Sort A→Z, Z→A, price low→high, high→low | List order matches each sort option |
| TC-INV-03 | Add one item | `adding a single product updates the cart badge to 1` | Add Sauce Labs Backpack | Cart badge shows `1` |
| TC-INV-04 | Add multiple items | `adding multiple products updates the cart badge correctly` | Add Backpack, Bike Light, Onesie | Cart badge shows `3` |
| TC-INV-05 | Remove from inventory | `removing a product from inventory decreases the badge` | Add 2 items → Remove one | Cart badge decreases to `1` |

### Checkout — `tests/checkout.spec.ts`

| ID | Test case | Playwright test | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-CHK-01 | Happy-path purchase | `full happy-path purchase flow for two products` | Add 2 products → Cart → Checkout → fill info → Continue → Finish | “Thank you for your order!”; cart empty after return home |
| TC-CHK-02 | Required-field validation | `checkout form validation shows error when required fields are empty` | Add item → Checkout → Continue with empty fields | Error: First Name is required |
| TC-CHK-03 | Remove from cart | `user can remove an item from the cart before checking out` | Add 2 products → Cart → Remove one | Cart shows 1 remaining item |

### problem_user (negative) — `tests/problem-user.spec.ts`

These cases document known Sauce Demo defects for `problem_user` (asserting broken behavior).

| ID | Test case | Playwright test | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-PROB-01 | Broken product images | `product images are broken (404 assets) for every item` | Login as `problem_user` → view inventory | Every image `src` contains `404`; all share one broken asset |
| TC-PROB-02 | Sort does not apply | `sorting by name Z to A does not reorder the product list` | Sort A→Z, then Z→A | Product order does not reverse |
| TC-PROB-03 | Fleece add-to-cart fails | `Add to cart for Fleece Jacket does not update the cart badge` | Click Add to cart on Fleece Jacket | Button stays “Add to cart”; badge remains empty |
| TC-PROB-04 | Remove fails | `Remove does not work after adding Backpack to the cart` | Add Backpack → click Remove | Badge stays at `1`; Remove still visible |
| TC-PROB-05 | Last name not persisted | `checkout cannot continue because last name never persists` | Add Backpack → Checkout → fill all fields → Continue | Last name empty; error: Last Name is required |

**Total automated cases:** 16 (`3` auth + `5` inventory + `3` checkout + `5` problem_user)

## Shared credentials

Hardcoded in `fixtures/test-data.ts` (public demo accounts):

| Username | Password | Used by |
| --- | --- | --- |
| `standard_user` | `secret_sauce` | `auth.setup.ts`, `auth.spec.ts`, inventory & checkout via `storageState` |
| `locked_out_user` | `secret_sauce` | `auth.spec.ts` |
| `problem_user` | `secret_sauce` | `problem-user.spec.ts` (`problemUserInventory` fixture) |
| `performance_glitch_user` | `secret_sauce` | Defined for future use |

## Design decisions

### Why Page Object Model?

Page classes own locators and user actions (`login`, `addToCart`, `sortBy`, `fillCheckoutInfo`, …). Specs stay focused on intent and assertions. When the UI changes, updates land in one place instead of across every test.

### Why fixtures + storageState?

- **Page object fixtures** (`loginPage`, `inventoryPage`, …) keep construction consistent and typed.
- **`authenticatedInventory`** navigates to a known inventory URL for authenticated specs.
- **`problemUserInventory`** logs in as `problem_user` for negative / defect specs (no `standard_user` storageState).
- **`auth.setup.ts` + `storageState`** logs in once per worker setup and reuses the session for inventory/checkout, so those tests do not repeat the login UI. Auth and problem-user specs run in a separate project **without** storageState so they exercise a clean session.

### Locator strategy

Prefer user-facing locators first:

1. `getByRole`, `getByPlaceholder`, `getByText`
2. Sauce Demo’s stable `data-test` attributes via `getByTestId` (`testIdAttribute: 'data-test'` in config)
3. Structural selectors (e.g. `.inventory_item`) only when filtering by product name

Assertions are web-first (`toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`). The suite does not use `waitForTimeout` or other hard waits.

### Config choices

`playwright.config.ts` enables:

- `fullyParallel: true`
- `trace: 'on-first-retry'`
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- 30s test timeout / 10s expect timeout
- Chromium projects (unauthenticated for auth + problem-user specs; authenticated for inventory/checkout)

## Debugging failures

```bash
npm run report
npx playwright show-trace test-results/**/trace.zip
npm run test:ui
```

## Known limitations / future improvements

- **Chromium only** by default — add Firefox/WebKit projects for cross-browser coverage.
- **Public demo dependency** — Sauce Demo availability, latency, or content changes can flake CI.
- **Cart isolation** — `storageState` restores auth cookies, not cart contents; each test still mutates the live cart via UI. A reset helper or API seed (if available) would make multi-worker cart scenarios even safer.
- **Additional users** — `performance_glitch_user` is defined in shared data but not covered by dedicated performance specs yet. `problem_user` defects are covered in `problem-user.spec.ts`.
- **CI pipeline** — no GitHub Actions workflow is checked in; a sample workflow with artifact upload for the HTML report would be a natural next step.
- **Visual / accessibility checks** — not included; Playwright screenshots or axe-core could extend the suite for portfolio depth.

## License

MIT
