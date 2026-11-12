import { test, expect } from '@playwright/test';

test.describe('Iris Studio E2E Tests (Playwright)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Studio loads with Obsidian & Amethyst branding', async ({ page }) => {
    await expect(page).toHaveTitle(/Iris/);
    await expect(page.getByText('iris')).toBeVisible();
    await expect(page.getByText('Studio')).toBeVisible();
    await expect(page.getByText('Cercles Visuels Privés')).toBeVisible();
  });

  test('2. Photo feed displays authentic gear badges and SAS encryption tag', async ({ page }) => {
    // Gear badge from camera EXIF
    await expect(page.getByText(/Sony A7IV/)).toBeVisible();
    // Human-made badge
    await expect(page.getByText('Création 100% Humaine Vérifiée')).toBeVisible();
    // Anti-scraping SAS token indicator
    await expect(page.getByText('Chiffré SAS 15m (Anti-Scraping)')).toBeVisible();
  });

  test('3. Circle switching updates feed and inspector', async ({ page }) => {
    // Click on Family circle in left sidebar
    await page.getByRole('button', { name: /Famille & Vacances 2026/ }).click();

    // Inspector and header should update
    await expect(page.locator('header').getByText('Famille & Vacances 2026')).toBeVisible();
  });

  test('4. Interactive Critique Mode toggles coordinate pins and shows tooltip', async ({ page }) => {
    // Click Mode Critique button
    const critiqueBtn = page.getByRole('button', { name: /Mode Critique/ });
    await expect(critiqueBtn).toBeVisible();
    await critiqueBtn.click();

    // Canvas banner should appear
    await expect(page.getByText("Cliquez sur l'image pour épingler une critique technique")).toBeVisible();

    // Find and click the pin on the canvas
    const pin = page.locator('button:has(svg.lucide-pin)').last();
    await pin.click();

    // Critique tooltip should open
    await expect(page.getByText(/Superbe transition des teintes dorées/)).toBeVisible();
  });

  test('5. Universal Social Import modal detects platform and imports post', async ({ page }) => {
    // Open Import modal
    await page.getByRole('button', { name: 'Importer un Post' }).first().click();

    // Check modal opened
    await expect(page.getByText('Import Social Universel')).toBeVisible();

    // Type Instagram post URL
    const input = page.getByPlaceholder(/instagram\.com/);
    await input.fill('https://www.instagram.com/p/DB12345678/');

    // Platform tag should be detected automatically
    await expect(page.getByText('Instagram détecté • Attribution automatique conservée')).toBeVisible();

    // Submit import
    await page.getByRole('button', { name: 'Importer dans le Cercle' }).click();

    // Modal should close and new post appear in feed
    await expect(page.getByText('Importé via Iris Web Importer')).toBeVisible();
  });

  test('6. Circle Inspector displays active CirclePolicy security rules', async ({ page }) => {
    await expect(page.getByText('Règles Actives (CirclePolicy)')).toBeVisible();
    await expect(page.getByText('Filtre Anti-IA')).toBeVisible();
    await expect(page.getByText('Preuve Matériel (EXIF)')).toBeVisible();
    await expect(page.getByText('Nettoyage GPS')).toBeVisible();
  });
});
