# Project status

## Implemented and verified
- 34 country-specific handmade rug categories: 15 from Pakistan and 19 from Afghanistan. Shared category names remain distinguishable by country; existing rugs can be reassigned through Admin.
- Search, country/category filters, price sorting, product descriptions, materials, dimensions and photo galleries.
- Up to eight desktop-selected JPEG, PNG or WebP photos per rug, 8 MB each. New images are stored on backend disk with generated filenames, size limits and signature checks. Existing cloud URLs remain readable; re-upload those rugs to move photos to disk.
- Two locally configured admins with email/password sign-in, salted scrypt hashes, one-hour sessions, server-side logout, account-change invalidation and login throttling. Real credentials and hashes are excluded from Git. Configure deployment accounts separately with the private setup utility.
- Protected admin and customer-order APIs, server-calculated product prices, input limits and generic server errors.
- Per-rug reviews, unpublished by default, with admin publishing/deletion. Reviews are not verified purchases.
- Privacy information and checkout disclosures. Checkout currently submits an order request; it does not collect online payments.
- Persistent local MongoDB via Docker Compose, bound only to localhost. Its development allocator setting avoids the observed kernel compatibility issue. See [Admin and database setup](ADMIN_SETUP.md).
- Ignore rules prevent environment files, dependencies, builds and uploads from being committed. Local files were preserved when removing the old tracked copies.
- Dependency lockfile updates, Dependabot configuration, a pull-request template and root test/build commands. CI configuration is kept separately until GitHub authorization permits workflow uploads.

## Verification completed
All five backend tests passed, including independent admin logins, invalid credentials, session expiration/revocation, login throttling, private order reads, pricing and review validation. The production frontend build passed. A live isolated MongoDB test passed for sign-in, photo upload, category/country persistence, review moderation and deletion. Its temporary database and uploaded fixture were removed. Browser-based visual and accessibility testing remains outstanding.

## Local setup
Use Node 22, install dependencies with `npm ci`, `npm ci --prefix backend`, and `npm ci --prefix frontend`. Start MongoDB with `docker compose up -d mongodb`, configure ignored environment files using their examples, then run `npm start`.

The storefront is at http://localhost:5173 and administration is at /admin. See [Admin and database setup](ADMIN_SETUP.md) to provision or rotate credentials. The shared ADMIN_TOKEN is no longer used. Do not copy local account credentials into frontend variables, screenshots, issue bodies or Git commits.

## GitHub workflow
Develop on feature branches and open pull requests for review. Preserve separate feature commits with a merge commit or rebase merge. Require CI checks and reviewer approval on main through GitHub repository settings; local configuration files do not enable branch protection themselves. Enable available secret scanning and push protection.

The original repository tracked environment files. Rotate any credentials previously committed; untracking files now does not erase old history. No history rewrite or force push was performed. Coordinate any future history cleanup with collaborators.

## Before paid public sales
- Implement hosted payments with authenticated, idempotent webhooks, an explicit currency, tax rules and shipping calculations. Never store raw card details.
- Add atomic inventory reservations, sold-out behavior, SKU management, cancellation/restocking, private customer tracking, confirmation messages and operational order management.
- Confirm shipping regions, prices, delivery estimates, return/refund rules, terms, business identity, data retention and applicable regional privacy obligations. The privacy information includes retention details still requiring store confirmation; it is not a compliance certification.
- Configure HTTPS, authenticated database access, persistent upload storage, monitoring, backups and restore testing. Public deployments need separate account configuration. Multiple backend instances require shared sessions and rate limiting.
- Resolve remaining frontend dependency audit findings. At the previous audit, compatible updates reduced frontend findings from 20 to 7 (6 moderate, 1 high); backend had zero findings. Root development tooling subsequently reported 2 critical findings. Re-audit and address these before deployment.
- Decode/re-encode and scan uploads before production, remove photo GPS/EXIF metadata, and maintain orphaned-file cleanup. Current upload validation checks raster signatures and preserves the original image bytes. Replacing a gallery or deleting a rug retains old photo files for maintenance review.
- Complete mobile/desktop browser QA, accessibility checks, SEO review, checkout concurrency tests and payment/shipping integration tests.

References: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
