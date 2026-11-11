import { test, expect } from '@playwright/test';
const rugs = [
  { _id: '507f1f77bcf86cd799439011', title: 'Bokhara Natural', category: 'BOKHARA', country: 'Pakistan', price: 250, material: 'Wool', dimensions: '4 × 6 ft', description: 'A geometric handmade rug.', imageUrl: '/images/bokhara-detail.jpg', images: ['/images/bokhara-detail.jpg', '/images/bokhara-green.jpg'] },
  { _id: '507f1f77bcf86cd799439012', title: 'Kilim Heritage', category: 'KILLIM', country: 'Afghanistan', price: 180, description: 'A woven rug.', imageUrl: '/images/bokhara-green.jpg' },
];
async function mockCatalog(page) {
  await page.route('**/api/carpets**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/reviews')) return route.fulfill({ json: [] });
    const rug = rugs.find(item => url.pathname.endsWith('/' + item._id));
    await route.fulfill({ json: rug || rugs });
  });
}
async function noOverflow(page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); }

test('light/dark toggle updates surfaces and survives refresh and navigation', async ({ page }) => {
  await mockCatalog(page); await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const light = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.screenshot({ path: '/tmp/kashif-home-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(light);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Shop rugs', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: '/tmp/kashif-collection-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('system preference is used initially and explicit preference takes priority', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' }); await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme and shopping remain usable with blocked browser storage', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await mockCatalog(page); await page.goto('/carpets');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Add Bokhara Natural to bag' }).click();
  await expect(page.getByRole('link', { name: 'Shopping bag, 1 item' })).toBeVisible();
});

test('country/category filters support collection links and keep shared rug names usable', async ({ page }) => {
  await mockCatalog(page); await page.goto('/carpets?country=Afghanistan');
  await expect(page.getByRole('heading', { name: 'Kilim Heritage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bokhara Natural' })).toHaveCount(0);
  await page.getByLabel('Country', { exact: true }).selectOption('Pakistan');
  await page.getByLabel('Category', { exact: true }).selectOption('BOKHARA');
  await expect(page.getByRole('heading', { name: 'Bokhara Natural' })).toBeVisible();
  await expect(page).toHaveURL(/country=Pakistan&category=BOKHARA/);
  await page.getByLabel('Search', { exact: true }).fill('not-a-rug');
  await expect(page.getByText('No rugs match this selection.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
});

test('gallery, shopping bag persistence and checkout request preserve the shopping flow', async ({ page }) => {
  await mockCatalog(page); await page.goto('/carpets/' + rugs[0]._id);
  await page.getByRole('button', { name: 'View rug photo 2' }).click();
  await expect(page.locator('.detail-main-image')).toHaveAttribute('src', '/images/bokhara-green.jpg');
  await page.getByLabel('Quantity', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Add to bag', exact: false }).click();
  await expect(page.locator('.bag-item')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.bag-item')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Shopping bag, 2 items' })).toBeVisible();
  await page.getByRole('link', { name: 'Continue to checkout', exact: false }).click();
  for (const [label, value] of [['Full name', 'Test Buyer'], ['Email', 'buyer@example.com'], ['Phone', '123456789'], ['Street address', 'Test Street'], ['City', 'Lahore'], ['State / province', 'Punjab'], ['Postal code', '54000'], ['Country', 'Pakistan']]) await page.getByLabel(label, { exact: false }).fill(value);
  await page.route('**/api/orders', async route => {
    const body = route.request().postDataJSON();
    expect(body.items).toEqual([{ carpet: rugs[0]._id, quantity: 2 }]);
    expect(body).not.toHaveProperty('totalAmount');
    await route.fulfill({ status: 201, json: { _id: 'test-order-reference', totalAmount: 500 } });
  });
  await page.getByRole('button', { name: 'Place order request', exact: false }).click();
  await expect(page.getByText('test-order-reference', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Shopping bag, 0 items' })).toBeVisible();
});

test('mobile menu, content and forms fit the screen in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await mockCatalog(page); await page.goto('/');
  await noOverflow(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    for (const path of ['/', '/carpets', '/about', '/contact', '/privacy', '/admin', '/cart']) {
      await page.goto(path); await noOverflow(page); await expect(page.locator('main')).toBeVisible();
    }
  }
  await page.goto('/'); await page.screenshot({ path: '/tmp/kashif-home-mobile-dark.png', fullPage: true });
});

test('admin editor keeps desktop uploads and country-specific categories usable in both themes', async ({ page }) => {
  await mockCatalog(page);
  await page.route('**/api/auth/login', route => route.fulfill({ json: { token: 'mock-session-for-ui-only', email: 'admin@example.com' } }));
  await page.route('**/api/reviews', route => route.fulfill({ json: [] }));
  let uploaded = '';
  await page.route('**/api/carpets', async route => {
    if (route.request().method() === 'POST') {
      uploaded = route.request().postDataBuffer().toString();
      return route.fulfill({ status: 201, json: rugs[0] });
    }
    return route.fulfill({ json: rugs });
  });
  await page.goto('/admin');
  await page.getByLabel('Admin email').fill('admin@example.com');
  await page.getByLabel('Password', { exact: true }).fill('ui-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Signed in as admin@example.com')).toBeVisible();
  await page.locator('select[name="category"]').selectOption('Afghanistan:KILLIM');
  await page.locator('input[name="title"]').fill('UI test rug');
  await page.locator('input[name="price"]').fill('250');
  await page.getByLabel('About this rug').fill('Temporary browser fixture');
  await page.locator('input[type="file"]').setInputFiles({ name: 'test-rug.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhKkAAAAASUVORK5CYII=', 'base64') });
  await expect(page.getByText('Country: Afghanistan', { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/kashif-admin-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.getByRole('button', { name: 'Add Carpet', exact: true }).click();
  await expect.poll(() => uploaded).toContain('Afghanistan');
  expect(uploaded).toContain('KILLIM'); expect(uploaded).toContain('test-rug.png');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
