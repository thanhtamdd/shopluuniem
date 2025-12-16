import { test, expect } from '@playwright/test';

test.describe('Complete Shopping Flow', () => {
  
  test('User can browse, add to cart, and checkout', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Shop/i);
    
    // Step 2: Navigate to shop page
    await page.click('a[href*="shop"]');
    await expect(page).toHaveURL(/shop/);
    
    // Step 3: Filter by category
    await page.click('text=Áo');
    await page.waitForLoadState('networkidle');
    
    // Verify products are displayed
    const products = page.locator('.product, [class*="product"]');
    await expect(products.first()).toBeVisible();
    
    // Step 4: Click first product
    await products.first().click();
    await expect(page).toHaveURL(/detail/);
    
    // Step 5: Select size and add to cart
    await page.selectOption('select[name="size"]', 'L');
    await page.click('text=Add to cart');
    
    // Verify success message
    await expect(page.locator('.modal_success, .success')).toBeVisible();
    
    // Step 6: Go to cart
    await page.click('a[href="/cart"]');
    await expect(page).toHaveURL('/cart');
    
    // Verify cart has items
    const cartItems = page.locator('tbody tr');
    await expect(cartItems).toHaveCount(1, { timeout: 5000 });
    
    // Step 7: Update quantity
    await page.click('.inc.qtybutton');
    await page.waitForTimeout(500);
    
    // Verify quantity updated
    const quantityInput = page.locator('input.cart-plus-minus-box');
    await expect(quantityInput).toHaveValue('2');
    
    // Step 8: Apply coupon (if available)
    await page.fill('input[placeholder*="Coupon"]', 'DISCOUNT10');
    await page.click('input[value="Apply coupon"]');
    await page.waitForTimeout(1000);
    
    // Step 9: Proceed to checkout
    await page.click('text=Proceed to checkout');
    
    // If not logged in, should redirect to login
    const currentUrl = page.url();
    if (currentUrl.includes('signin')) {
      // Login
      await page.fill('input[placeholder*="Username"]', 'testuser');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect back to cart/checkout
      await page.waitForURL(/cart|checkout/);
    }
    
    // Fill checkout form
    await page.fill('input[placeholder*="Location"]', '123 Test Street, HCM');
    await page.click('input[value="CHECKING"]');
    await page.waitForTimeout(2000);
    
    await page.click('input[value="Next"]');
    await page.waitForLoadState('networkidle');
    
    // Fill billing details
    await page.fill('input[placeholder*="Fullname"]', 'Test User');
    await page.fill('input[placeholder*="Phone"]', '0123456789');
    await page.fill('input[placeholder*="Email"]', 'test@example.com');
    
    // Submit order
    await page.click('input[value="Place order"]');
    
    // Verify success page
    await expect(page).toHaveURL(/success/, { timeout: 10000 });
    await expect(page.locator('text=Success, text=Thành công')).toBeVisible();
  });
  
  test('User can search for products', async ({ page }) => {
    await page.goto('/');
    
    // Find and use search box
    const searchInput = page.locator('input[type="text"][placeholder*="search"], input[type="search"]');
    await searchInput.fill('áo');
    await searchInput.press('Enter');
    
    // Verify search results
    await page.waitForURL(/search/);
    const products = page.locator('.product, [class*="product"]');
    await expect(products.first()).toBeVisible();
  });
  
  test('User can view order history', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[placeholder*="Username"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/^(?!.*signin)/);
    
    // Go to history
    await page.goto('/history');
    
    // Verify orders are displayed
    const orders = page.locator('table tbody tr, .order-item');
    await expect(orders.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('User Authentication', () => {
  
  test('User can register', async ({ page }) => {
    await page.goto('/signup');
    
    const timestamp = Date.now();
    await page.fill('input[placeholder*="Email"]', `test${timestamp}@example.com`);
    await page.fill('input[placeholder*="First Name"]', 'Test User');
    await page.fill('input[placeholder*="Username"]', `testuser${timestamp}`);
    await page.fill('input[placeholder*="Password"]', 'Test@123');
    await page.fill('input[placeholder*="Confirm Password"]', 'Test@123');
    
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=thành công, text=success')).toBeVisible();
  });
  
  test('User can login', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('input[placeholder*="Username"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to home
    await expect(page).toHaveURL(/^(?!.*signin)/);
  });
  
  test('User cannot login with wrong credentials', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('input[placeholder*="Username"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Wrong, text=Sai')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {
  
  test.beforeEach(async ({ page }) => {
    // Admin login
    await page.goto('http://localhost:3001/signin');
    await page.fill('input[placeholder*="Username"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/user|customer/);
  });
  
  test('Admin can view user list', async ({ page }) => {
    await page.goto('http://localhost:3001/user');
    
    const users = page.locator('table tbody tr');
    await expect(users.first()).toBeVisible();
  });
  
  test('Admin can create new user', async ({ page }) => {
    await page.goto('http://localhost:3001/user/create');
    
    const timestamp = Date.now();
    await page.fill('input[name="fullname"]', 'Test Admin User');
    await page.fill('input[name="username"]', `adminuser${timestamp}`);
    await page.fill('input[name="email"]', `admin${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'Admin@123');
    await page.selectOption('select[name="permission"]', '1');
    
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('.alert-success, text=thành công')).toBeVisible();
  });
  
  test('Admin can view products', async ({ page }) => {
    await page.goto('http://localhost:3001/product');
    
    const products = page.locator('table tbody tr');
    await expect(products.first()).toBeVisible();
  });
  
  test('Admin can view orders', async ({ page }) => {
    await page.goto('http://localhost:3001/order');
    
    const orders = page.locator('table tbody tr');
    await expect(orders.first()).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  
  test('Mobile - Shopping flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Open mobile menu if needed
    const menuButton = page.locator('button.navbar-toggler, .mobile-menu-btn');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Navigate to shop
    await page.click('a[href*="shop"]');
    await expect(page).toHaveURL(/shop/);
    
    // Click product
    const products = page.locator('.product, [class*="product"]');
    await products.first().click();
    
    // Add to cart
    await page.click('text=Add to cart');
    await expect(page.locator('.modal_success, .success')).toBeVisible();
  });
  
  test('Tablet - Layout adjusts correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Check if layout is responsive
    const container = page.locator('.container');
    const boundingBox = await container.boundingBox();
    
    expect(boundingBox.width).toBeLessThanOrEqual(768);
  });
});

test.describe('Performance', () => {
  
  test('Homepage loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('Product page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/detail/1', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Accessibility', () => {
  
  test('All images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });
  
  test('Forms have proper labels', async ({ page }) => {
    await page.goto('/signin');
    
    const inputsWithoutLabel = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
      let count = 0;
      inputs.forEach(input => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.placeholder;
        if (!hasLabel) count++;
      });
      return count;
    });
    
    expect(inputsWithoutLabel).toBe(0);
  });
  
  test('Page has proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});