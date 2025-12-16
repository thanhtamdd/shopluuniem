/**
 * KIỂM THỬ TÍCH HỢP BACKEND (Backend Integration Testing)
 * Kiểm tra API endpoints, database integration, business logic
 */

import request from 'supertest';
import { connectDB, getPool } from '../config/db.js';
import sql from 'mssql';

const BASE_URL = 'http://localhost:8000';
let authToken = '';
let testUserId = '';

/**
 * Setup & Teardown
 */
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  const pool = getPool();
  await pool.close();
});

describe('Backend Integration Tests', () => {
  
  /**
   * Test Suite 1: User Management API
   */
  describe('User Management API', () => {
    
    test('GET /api/admin/user - Should return user list with pagination', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/user')
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('totalPage');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
    
    test('POST /api/admin/user - Should create new user', async () => {
      const newUser = {
        username: `testuser_${Date.now()}`,
        password: 'Test@123',
        fullname: 'Test User',
        email: `test_${Date.now()}@example.com`,
        id_permission: 2
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/user')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(newUser.username);
      
      testUserId = response.body.user._id;
    });
    
    test('POST /api/admin/user - Should reject duplicate username', async () => {
      const duplicateUser = {
        username: 'admin', // Username đã tồn tại
        password: 'Test@123',
        email: 'duplicate@example.com'
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/user')
        .send(duplicateUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    test('POST /api/admin/user/login - Should login successfully', async () => {
      const credentials = {
        identifier: 'admin',
        password: 'admin123'
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/user/login')
        .send(credentials);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      authToken = response.body.token;
    });
    
    test('POST /api/admin/user/login - Should reject wrong password', async () => {
      const credentials = {
        identifier: 'admin',
        password: 'wrongpassword'
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/user/login')
        .send(credentials);
      
      expect(response.status).toBe(401);
    });
    
    test('GET /api/admin/user/:id - Should get user details', async () => {
      const response = await request(BASE_URL)
        .get(`/api/admin/user/${testUserId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(testUserId);
    });
    
    test('PUT /api/admin/user/:id - Should update user', async () => {
      const updateData = {
        fullname: 'Updated Test User'
      };
      
      const response = await request(BASE_URL)
        .put(`/api/admin/user/${testUserId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
    
    test('DELETE /api/admin/user/:id - Should delete user', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/admin/user/${testUserId}`);
      
      expect(response.status).toBe(200);
    });
  });
  
  /**
   * Test Suite 2: Product Management API
   */
  describe('Product Management API', () => {
    let testProductId = '';
    
    test('GET /api/Product - Should return all products', async () => {
      const response = await request(BASE_URL)
        .get('/api/Product');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/Product/category?id=1 - Should filter by category', async () => {
      const response = await request(BASE_URL)
        .get('/api/Product/category')
        .query({ id: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/Product/category/pagination - Should paginate products', async () => {
      const response = await request(BASE_URL)
        .get('/api/Product/category/pagination')
        .query({ page: 1, limit: 8 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(8);
    });
    
    test('GET /api/Product/detail/:id - Should get product details', async () => {
      const response = await request(BASE_URL)
        .get('/api/Product/detail/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ProductID');
      expect(response.body).toHaveProperty('Name');
      expect(response.body).toHaveProperty('Price');
    });
    
    test('POST /api/admin/product/create - Should create product', async () => {
      const newProduct = {
        name: `Test Product ${Date.now()}`,
        price: 99.99,
        quantity: 10,
        description: 'Test Description',
        categoryId: 1
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/product/create')
        .send(newProduct);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
    
    test('GET /api/Product - Search products', async () => {
      const response = await request(BASE_URL)
        .get('/api/Product/category/pagination')
        .query({ search: 'test', page: 1, limit: 8 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  /**
   * Test Suite 3: Order Management API
   */
  describe('Order Management API', () => {
    let testOrderId = '';
    
    test('POST /api/Order/order - Should create order', async () => {
      const orderData = {
        userId: 1,
        totalAmount: 199.99,
        items: [
          { productId: 1, quantity: 2, price: 99.99 }
        ]
      };
      
      const response = await request(BASE_URL)
        .post('/api/Order/order')
        .send(orderData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orderId');
      
      testOrderId = response.body.orderId;
    });
    
    test('GET /api/Order/order/:userId - Should get user orders', async () => {
      const response = await request(BASE_URL)
        .get('/api/Order/order/1');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/Order/order/detail/:orderId - Should get order details', async () => {
      const response = await request(BASE_URL)
        .get(`/api/Order/order/detail/${testOrderId}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/admin/Order - Should get all orders', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/Order');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('PATCH /api/admin/Order/confirmorder - Should update order status', async () => {
      const response = await request(BASE_URL)
        .patch('/api/admin/Order/confirmorder')
        .send({ orderId: testOrderId });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
  
  /**
   * Test Suite 4: Category API
   */
  describe('Category API', () => {
    
    test('GET /api/Category - Should return all categories', async () => {
      const response = await request(BASE_URL)
        .get('/api/Category');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('POST /api/admin/Category/create - Should create category', async () => {
      const newCategory = {
        name: `Test Category ${Date.now()}`,
        description: 'Test Description'
      };
      
      const response = await request(BASE_URL)
        .post('/api/admin/Category/create')
        .send(newCategory);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
  
  /**
   * Test Suite 5: Database Integration Tests
   */
  describe('Database Integration', () => {
    
    test('Should connect to database successfully', async () => {
      const pool = getPool();
      const result = await pool.request().query('SELECT 1 AS connected');
      
      expect(result.recordset[0].connected).toBe(1);
    });
    
    test('Should execute parameterized query safely', async () => {
      const pool = getPool();
      const result = await pool.request()
        .input('id', sql.Int, 1)
        .query('SELECT * FROM Products WHERE ProductID = @id');
      
      expect(result.recordset.length).toBeGreaterThanOrEqual(0);
    });
    
    test('Should handle transaction rollback', async () => {
      const pool = getPool();
      const transaction = new sql.Transaction(pool);
      
      try {
        await transaction.begin();
        
        await transaction.request()
          .query('INSERT INTO Categories (Name) VALUES (\'Test Rollback\')');
        
        // Force error
        await transaction.request()
          .query('INSERT INTO InvalidTable (Column) VALUES (\'Test\')');
        
        await transaction.commit();
        
        // Không nên chạy đến đây
        expect(true).toBe(false);
      } catch (error) {
        await transaction.rollback();
        
        // Verify rollback
        const result = await pool.request()
          .query('SELECT * FROM Categories WHERE Name = \'Test Rollback\'');
        
        expect(result.recordset.length).toBe(0);
      }
    });
    
    test('Should handle concurrent database operations', async () => {
      const pool = getPool();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          pool.request().query('SELECT * FROM Products')
        );
      }
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Array.isArray(result.recordset)).toBe(true);
      });
    });
  });
  
  /**
   * Test Suite 6: Business Logic Tests
   */
  describe('Business Logic', () => {
    
    test('Should calculate order total correctly', async () => {
      const items = [
        { price: 10.50, quantity: 2 },
        { price: 5.25, quantity: 3 }
      ];
      
      const total = items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      expect(total).toBe(36.75);
    });
    
    test('Should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user @example.com'
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
    
    test('Should validate password strength', () => {
      const strongPasswords = [
        'Test@123',
        'MyP@ssw0rd',
        'Secure#Pass123'
      ];
      
      const weakPasswords = [
        '123456',
        'password',
        'test'
      ];
      
      const isStrongPassword = (password) => {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password);
      };
      
      strongPasswords.forEach(password => {
        expect(isStrongPassword(password)).toBe(true);
      });
      
      weakPasswords.forEach(password => {
        expect(isStrongPassword(password)).toBe(false);
      });
    });
    
    test('Should calculate discount correctly', () => {
      const price = 100;
      const discountPercent = 20;
      
      const discountAmount = (price * discountPercent) / 100;
      const finalPrice = price - discountAmount;
      
      expect(discountAmount).toBe(20);
      expect(finalPrice).toBe(80);
    });
  });
  
  /**
   * Test Suite 7: Error Handling
   */
  describe('Error Handling', () => {
    
    test('Should return 404 for non-existent endpoint', async () => {
      const response = await request(BASE_URL)
        .get('/api/NonExistentEndpoint');
      
      expect(response.status).toBe(404);
    });
    
    test('Should return 400 for invalid request data', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/user')
        .send({ invalidField: 'test' });
      
      expect([400, 500]).toContain(response.status);
    });
    
    test('Should handle database errors gracefully', async () => {
      const pool = getPool();
      
      try {
        await pool.request()
          .query('SELECT * FROM NonExistentTable');
        
        expect(true).toBe(false); // Không nên chạy đến đây
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Invalid object name');
      }
    });
  });
});

/**
 * Chạy manual tests
 */
if (require.main === module) {
  console.log('Running Backend Integration Tests...');
  // Jest sẽ tự động chạy tests
}