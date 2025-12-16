import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  
  test('Homepage screenshot comparison', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });
  
  test('Product page screenshot comparison', async ({ page }) => {
    await page.goto('/detail/1');
    await expect(page).toHaveScreenshot('product-page.png');
  });
  
  test('Cart page screenshot comparison', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveScreenshot('cart-page.png');
  });
});