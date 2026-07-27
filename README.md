# Sauce Demo Playwright Suite

End-to-end automation for [Sauce Demo](https://www.saucedemo.com/) using **Playwright**, **TypeScript**, and the **Page Object Model**. The suite is structured as a portfolio-ready project: isolated specs, reusable fixtures, resilient locators, and clear documentation for onboarding.

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
# Headless (default)
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

Run a single file:

```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/inventory.spec.ts
npx playwright test tests/checkout.spec.ts
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
│   ├── auth.fixture.ts      # Page objects + authenticatedInventory fixture
│   └── test-data.ts         # Shared credentials, products, checkout data
└── tests/
    ├── auth.setup.ts        # Writes storageState for standard_user
    ├── auth.spec.ts
    ├── inventory.spec.ts
    └── checkout.spec.ts
```

## What each test file validates

### `auth.spec.ts`

| # | Scenario |
| --- | --- |
| 1 | Successful login with `standard_user` → lands on the inventory page |
| 2 | `locked_out_user` shows the locked-out error and does not reach inventory |
| 3 | Invalid username/password shows the credentials mismatch error |

### `inventory.spec.ts`

| # | Scenario |
| --- | --- |
| 1 | After login, the product list is visible and contains the expected catalog |
| 2 | Sorting works for Name (A→Z), Name (Z→A), Price (low→high), Price (high→low) |
| 3 | Adding a single product sets the cart badge to `1` |
| 4 | Adding multiple products updates the cart badge correctly |
| 5 | Removing a product from inventory decreases the badge |

### `checkout.spec.ts`

| # | Scenario |
| --- | --- |
| 1 | Happy-path purchase: login → add 2 products → cart → checkout → finish → confirmation + empty cart |
| 2 | Checkout form validation: continue with empty required fields shows the expected error |
| 3 | User can remove an item from the cart page before checking out |

## Shared credentials

Hardcoded in `fixtures/test-data.ts` (public demo accounts):

| Username | Password |
| --- | --- |
| `standard_user` | `secret_sauce` |
| `locked_out_user` | `secret_sauce` |
| `problem_user` | `secret_sauce` |
| `performance_glitch_user` | `secret_sauce` |

Inventory and checkout specs authenticate as `standard_user` via `storageState` produced by `tests/auth.setup.ts`.

## Design decisions

### Why Page Object Model?

Page classes own locators and user actions (`login`, `addToCart`, `sortBy`, `fillCheckoutInfo`, …). Specs stay focused on intent and assertions. When the UI changes, updates land in one place instead of across every test.

### Why fixtures + storageState?

- **Page object fixtures** (`loginPage`, `inventoryPage`, …) keep construction consistent and typed.
- **`authenticatedInventory`** navigates to a known inventory URL for authenticated specs.
- **`auth.setup.ts` + `storageState`** logs in once per worker setup and reuses the session for inventory/checkout, so those tests do not repeat the login UI. Auth specs run in a separate project **without** storageState so they can exercise the login page from a clean session.

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
- Chromium projects (unauthenticated for auth specs; authenticated for the rest)

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
- **Additional users** — `problem_user` and `performance_glitch_user` are defined in shared data but not covered by dedicated negative/performance specs yet.
- **CI pipeline** — no GitHub Actions workflow is checked in; a sample workflow with artifact upload for the HTML report would be a natural next step.
- **Visual / accessibility checks** — not included; Playwright screenshots or axe-core could extend the suite for portfolio depth.

## License

MIT
