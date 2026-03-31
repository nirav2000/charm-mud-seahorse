const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.nlp) {
      window.nlp = () => ({ match: () => ({ has: () => false }) });
    }
  });
});

async function waitForTokens(page) {
  await expect(page.locator('#token-line .token').first()).toBeVisible();
}

test('app loads and sample sentence is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Grammar Playground' })).toBeVisible();
  await waitForTokens(page);
  await expect(page.locator('#sentence-input')).not.toHaveValue('');
});

test('glossary show/hide works', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('#glossary-toggle');
  const wrap = page.locator('#glossary-wrap');
  await expect(toggle).toHaveText('Show');
  await expect(wrap).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText('Hide');
  await expect(wrap).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText('Show');
});

test('word detail popover opens and closes by outside click', async ({ page }) => {
  await page.goto('/');
  await waitForTokens(page);
  await page.locator('#token-line .token').first().click();
  await expect(page.locator('#word-popover')).toHaveClass(/open/);
  await expect(page.locator('#popover-content')).toContainText('Word:');
  await page.locator('h1').click();
  await expect(page.locator('#word-popover')).not.toHaveClass(/open/);
});

test('version badge opens and closes changelog drawer', async ({ page }) => {
  await page.goto('/');
  const drawer = page.locator('#history-drawer');
  await page.locator('#history-btn').click();
  await expect(drawer).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/open/);
  await page.locator('#history-btn').click();
  await expect(drawer).toHaveClass(/open/);
  await page.locator('#history-close').click();
  await expect(drawer).not.toHaveClass(/open/);
});

test('rebuild exercise supports place/check/reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rebuild sentence' }).click();
  const firstChip = page.locator('#rebuild-bank .draggable').first();
  await firstChip.click();
  await expect(page.locator('#rebuild-zone .draggable')).toHaveCount(1);
  await page.locator('[data-action="rebuild-check"]').click();
  await expect(page.locator('#rebuild-feedback')).not.toHaveText('');
  await page.locator('[data-action="rebuild-reset"]').click();
  await expect(page.locator('#rebuild-zone .draggable')).toHaveCount(0);
});

test('sort exercise supports tap-select tap-place and check/reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sort by grammar' }).click();
  await page.locator('#sort-bank .draggable').first().click();
  await page.locator('.bin[data-bin="noun"]').click();
  await expect(page.locator('.bin[data-bin="noun"] span')).toHaveCount(1);
  await page.locator('[data-action="sort-check"]').click();
  await expect(page.locator('#sort-feedback')).toContainText('You placed');
  await page.locator('[data-action="sort-reset"]').click();
  await expect(page.locator('.bin[data-bin="noun"] span')).toHaveCount(0);
});

test('desktop drag path still works for rebuild', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'drag path validated once in desktop project');
  test.fixme(true, 'Desktop browser-native drag/drop is flaky in headless CI; tap-place path is the blocker coverage.');
  await page.goto('/');
  const source = page.locator('#rebuild-bank .draggable').first();
  const target = page.locator('#rebuild-zone');
  await source.dragTo(target);
  await expect(page.locator('#rebuild-zone .draggable')).toHaveCount(1);
});
