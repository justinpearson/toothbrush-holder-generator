import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('downloads a .scad file with the expected content', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download .scad' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('toothbrush-holder.scad');

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');

  expect(text).toContain('base_length =');
  expect(text).toContain('module toothbrush_holder()');
  expect(text).toContain('drain_through_base = false;');
});

test('downloads a non-empty .stl file', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download .stl' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('toothbrush-holder.stl');

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const buf = Buffer.concat(chunks);

  // Binary STL: 80-byte header + 4-byte triangle count + 50 bytes/triangle.
  expect(buf.byteLength).toBeGreaterThan(84);
  const triCount = buf.readUInt32LE(80);
  expect(buf.byteLength).toBe(84 + triCount * 50);
});
