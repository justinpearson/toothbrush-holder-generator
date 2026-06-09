import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders all three views', async ({ page }) => {
  await expect(page.getByTestId('top-view')).toBeVisible();
  await expect(page.getByTestId('side-view')).toBeVisible();
  await expect(page.getByTestId('three-view')).toBeVisible();
  await expect(page.getByTestId('three-view').locator('canvas')).toBeVisible();
});

test('filament picker selects a preview color', async ({ page }) => {
  const picker = page.getByTestId('filament-picker');
  await expect(picker).toBeVisible();
  const green = picker.getByRole('button', { name: 'Green' });
  await green.click();
  await expect(green).toHaveAttribute('aria-pressed', 'true');
});

test('links back to the GitHub repo', async ({ page }) => {
  const link = page.getByRole('link', { name: /view on github/i });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    'href',
    'https://github.com/justinpearson/toothbrush-holder-generator',
  );
});

test('changing baseplate length resizes the top-view plate', async ({ page }) => {
  const plate = page.getByTestId('top-plate');
  const before = await plate.getAttribute('width');
  await page.getByLabel('Length', { exact: true }).fill('150');
  await expect.poll(() => plate.getAttribute('width')).not.toBe(before);
});

test('changing the number of objects changes the object count', async ({ page }) => {
  await expect(page.getByTestId('top-object')).toHaveCount(4);
  await page.getByLabel('Number of objects', { exact: true }).fill('6');
  await expect(page.getByTestId('top-object')).toHaveCount(6);
});

test('switching an object shape updates its outline', async ({ page }) => {
  const firstCard = page.getByTestId('object-card').first();
  await firstCard.getByTestId('object-shape').selectOption('star');
  await expect(page.getByTestId('top-object').first()).toHaveAttribute(
    'data-shape',
    'star',
  );
});

test('making a tube solid removes its bore outline', async ({ page }) => {
  const firstTop = page.getByTestId('top-object').first();
  await expect(firstTop.locator('[data-role="inner"]')).toHaveCount(1);
  await page.getByTestId('object-card').first().getByTestId('object-type').selectOption('solid');
  await expect(firstTop.locator('[data-role="inner"]')).toHaveCount(0);
});

test('an override toggle reveals a per-object slider', async ({ page }) => {
  const card = page.getByTestId('object-card').first();
  // Object 1 inherits its diameter by default — no diameter slider yet.
  await expect(card.getByLabel('Diameter', { exact: true })).toHaveCount(0);
  await card.getByLabel('Override Diameter').check();
  await expect(card.getByLabel('Diameter', { exact: true })).toHaveCount(1);
});

test('changing a global default moves an inheriting object', async ({ page }) => {
  // Object 4 inherits the global diameter.
  const outer = page.getByTestId('top-object').nth(3).locator('[data-role="outer"]');
  const before = await outer.getAttribute('points');
  const globals = page.locator('section[aria-label="Global defaults"]');
  await globals.getByLabel('Diameter', { exact: true }).fill('90');
  await expect.poll(() => outer.getAttribute('points')).not.toBe(before);
});
