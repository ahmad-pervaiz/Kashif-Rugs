# Minimal storefront and appearance modes

The storefront uses a warm ivory/charcoal palette, serif display typography, restrained navigation, generous spacing and locally bundled rug photography. The collection, product detail, shopping bag, checkout, story, contact, privacy and admin pages use the same theme variables. Website functionality and the existing backend remain in place.

## Appearance

Use the sun/moon button in the header to switch modes on desktop or mobile. The first visit follows the browser's system colour preference. Explicit selections are stored under `kashifRugsTheme` in local storage, restored before the app renders, and synchronized across tabs. The switch remains usable when browser storage is unavailable. No account is required.

The interface supports keyboard focus, a skip-to-content link, named mobile-menu controls, Escape to close the menu, and reduced-motion preferences. Country/category filters have explicit accessible names and shareable URLs. The bag is restored on refresh without overwriting saved selections during mount. Delivery is described as confirmed by the store rather than promised free.

The two bundled homepage images come from existing local shop photographs. They are display crops of real rugs, not generated product photos. Uploaded catalog photos continue to use the backend upload feature. Homepage images have no GPS metadata.

## Verification

Install frontend dependencies, then build:

```bash
npm ci --prefix frontend
npm run build --prefix frontend
```

Run the browser suite with an installed Chrome browser on Linux:

```bash
CHROME_PATH=/usr/bin/google-chrome npm run test:ui --prefix frontend
```

Alternatively, install Playwright's Chromium and run without `CHROME_PATH`:

```bash
cd frontend
npx playwright install chromium
npm run test:ui
```

The suite starts its own Vite server at http://127.0.0.1:5180 and shuts it down afterwards. Product, order and login responses are mocked; it does not submit real orders, change accounts or write to the store database. Seven browser tests cover appearance persistence, first-visit system preference, unavailable browser storage, category/country filters, gallery and bag/checkout flows, mobile layout/navigation, and the admin editor's local-file upload and country-specific category controls. Tests check mobile horizontal overflow and save inspection screenshots under `/tmp`.

Verified: all seven browser tests and the production frontend build passed. Desktop light-mode and collection dark-mode screenshots, mobile dark-mode screenshots, and the signed-in admin editor were inspected during implementation. This is focused UI verification, not a full accessibility certification or paid-checkout integration test.

## Git review

The redesign is split into nine feature commits covering shared design tokens, theme preferences, navigation/footer, homepage, catalog, product detail/reviews, bag/checkout, story/contact/privacy, and admin/test tooling. Merge with a merge commit or rebase merge to retain the individual commits. GitHub contribution credit still depends on the account-linked author email and commits reaching the default branch.
