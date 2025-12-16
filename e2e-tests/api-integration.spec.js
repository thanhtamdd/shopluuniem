// File: e2e-tests/api-integration.spec.js
import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  
  test('API returns correct product data', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/Product');
    
    expect(response.ok()).toBeTruthy();
    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
  });
  
  test('API handles authentication', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/admin/user/login', {
      data: {
        identifier: 'admin',
        password: 'admin123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('token');
  });
  
  test('API protects admin endpoints', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/admin/user');
    
    // Should fail without token
    expect(response.status()).toBe(401);
  });
});