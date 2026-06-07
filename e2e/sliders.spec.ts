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

  const slider = page.getByLabel('Length', { exact: true });
  await slider.fill('150');

  await expect.poll(async () => plate.getAttribute('width')).not.toBe(before);
});

test('changing a tube diameter resizes its outer circle', async ({ page }) => {
  const circle = page.getByTestId('top-tube-outer').first();
  const before = await circle.getAttribute('r');

  // First tube's diameter slider (within the first tube row).
  const firstRow = page.getByTestId('tube-row').first();
  await firstRow.getByLabel('Diameter', { exact: true }).fill('80');

  await expect.poll(async () => circle.getAttribute('r')).not.toBe(before);
});

test('changing the number of tubes changes the tube count', async ({ page }) => {
  await expect(page.getByTestId('top-tube')).toHaveCount(4);
  await page.getByLabel('Number of tubes', { exact: true }).fill('6');
  await expect(page.getByTestId('top-tube')).toHaveCount(6);
});
