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

test('archived page can open version history modal', async ({ page }) => {
  await page.goto('/versions/1.1.3/index.html');
  const versionBtn = page.locator('#version-button');
  await expect(versionBtn).toBeVisible();
  await versionBtn.click();
  await expect(page.locator('#version-modal')).toHaveClass(/open/);
  await page.locator('#close-modal').click();
  await expect(page.locator('#version-modal')).not.toHaveClass(/open/);
});

test('missing archive 1.1.0 now exists', async ({ page }) => {
  const response = await page.request.get('/versions/1.1.0/index.html');
  expect(response.ok()).toBeTruthy();
});

test('word order: tap chip to place, check, reset, new sentence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Word Order' }).click();
  const firstChip = page.locator('#rebuild-bank .word-chip').first();
  await firstChip.click();
  await expect(page.locator('#rebuild-built .word-chip')).toHaveCount(1);
  await page.locator('[data-action="rebuild-check"]').click();
  await expect(page.locator('#rebuild-feedback')).not.toHaveText('Build the sentence in the correct order.');
  await page.locator('[data-action="rebuild-reset"]').click();
  await expect(page.locator('#rebuild-built .word-chip')).toHaveCount(0);
});

test('word order: tap placed chip to return it to bank', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Word Order' }).click();
  await page.locator('#rebuild-bank .word-chip').first().click();
  await expect(page.locator('#rebuild-built .word-chip')).toHaveCount(1);
  await page.locator('#rebuild-built .word-chip').first().click();
  await expect(page.locator('#rebuild-built .word-chip')).toHaveCount(0);
});

test('grammar quiz: choose a word type and get feedback', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Grammar Quiz' }).click();
  await expect(page.locator('#quiz-word-display')).toBeVisible();
  await page.locator('#quiz-choices button').first().click();
  await expect(page.locator('#quiz-feedback')).not.toHaveText('');
});

test('fill the gap: choose an answer and get feedback', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Fill the Gap' }).click();
  const choiceBtn = page.locator('[data-gap-choice]').first();
  await choiceBtn.click();
  await expect(page.locator('#compare-feedback')).not.toHaveText('Pick the best word for the gap.');
});
