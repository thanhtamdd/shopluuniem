/**
 * KIỂM THỬ HIỆU NĂNG (Performance Testing)
 * Sử dụng Artillery để kiểm thử tải
 * 
 * Cài đặt: npm install -g artillery
 * Chạy: artillery run performance-test.yml
 */
const http = require('http');
const { performance } = require('perf_hooks');

/**
 * Test 1: Response Time cho các API quan trọng
 */
async function testResponseTime() {
  const endpoints = [
    '/api/Product',
    '/api/Category',
    '/api/admin/user',
    '/api/Product/detail/1'
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    const start = performance.now();
    
    try {
      await fetch(`http://localhost:8000${endpoint}`);
      const end = performance.now();
      const responseTime = end - start;
      
      results.push({
        endpoint,
        responseTime: responseTime.toFixed(2),
        status: responseTime < 1000 ? 'PASS' : 'FAIL' // < 1s
      });
    } catch (error) {
      results.push({
        endpoint,
        error: error.message,
        status: 'ERROR'
      });
    }
  }
  
  console.table(results);
  return results;
}

/**
 * Test 2: Database Query Performance
 */
async function testDatabasePerformance() {
  const sql = require('mssql');
  const { connectDB } = require('./config/db');
  
  await connectDB();
  const pool = await sql.connect();
  
  const queries = [
    {
      name: 'Get All Products',
      query: 'SELECT * FROM Products'
    },
    {
      name: 'Get Products with JOIN',
      query: `SELECT p.*, c.Name 
              FROM Products p 
              JOIN Categories c ON p.CategoryID = c.CategoryID`
    },
    {
      name: 'Search Products',
      query: `SELECT * FROM Products 
              WHERE Name LIKE '%test%' 
              ORDER BY CreatedAt DESC 
              OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY`
    },
    {
      name: 'Complex Query - Orders with Details',
      query: `SELECT o.*, u.FullName, od.ProductID, od.Quantity
              FROM Orders o
              JOIN Users u ON o.UserID = u.UserID
              JOIN OrderDetails od ON o.OrderID = od.OrderID
              WHERE o.Status = 'pending'`
    }
  ];
  
  const results = [];
  
  for (const { name, query } of queries) {
    const start = performance.now();
    
    try {
      await pool.request().query(query);
      const end = performance.now();
      const executionTime = end - start;
      
      results.push({
        query: name,
        executionTime: executionTime.toFixed(2),
        status: executionTime < 500 ? 'PASS' : 'FAIL' // < 500ms
      });
    } catch (error) {
      results.push({
        query: name,
        error: error.message,
        status: 'ERROR'
      });
    }
  }
  
  console.table(results);
  return results;
}

/**
 * Test 3: Memory Usage Monitoring
 */
function testMemoryUsage() {
  const used = process.memoryUsage();
  const results = {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
    status: used.heapUsed < used.heapTotal * 0.9 ? 'PASS' : 'WARNING'
  };
  
  console.table(results);
  return results;
}

/**
 * Test 4: Concurrent Users Simulation
 */
async function testConcurrentUsers(userCount = 100) {
  console.log(`Testing with ${userCount} concurrent users...`);
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < userCount; i++) {
    promises.push(
      fetch('http://localhost:8000/api/Product')
        .then(res => ({ userId: i, status: res.status, success: true }))
        .catch(err => ({ userId: i, error: err.message, success: false }))
    );
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  const summary = {
    totalUsers: userCount,
    successfulRequests: successCount,
    failedRequests: failureCount,
    successRate: `${(successCount / userCount * 100).toFixed(2)}%`,
    totalTime: `${totalTime}ms`,
    avgResponseTime: `${(totalTime / userCount).toFixed(2)}ms`,
    status: successCount >= userCount * 0.95 ? 'PASS' : 'FAIL' // 95% success rate
  };
  
  console.table(summary);
  return summary;
}

/**
 * Test 5: Page Load Time (Frontend)
 */
async function testPageLoadTime() {
  const puppeteer = require('puppeteer');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const pages = [
    { name: 'Home', url: 'http://localhost:3000/' },
    { name: 'Shop', url: 'http://localhost:3000/shop/all' },
    { name: 'Product Detail', url: 'http://localhost:3000/detail/1' },
    { name: 'Cart', url: 'http://localhost:3000/cart' }
  ];
  
  const results = [];
  
  for (const { name, url } of pages) {
    const start = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - start;
    
    // Get performance metrics
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    const pageLoadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    const domContentLoaded = performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart;
    
    results.push({
      page: name,
      totalLoadTime: `${loadTime}ms`,
      pageLoadTime: `${pageLoadTime}ms`,
      domContentLoaded: `${domContentLoaded}ms`,
      status: loadTime < 3000 ? 'PASS' : 'FAIL' // < 3s
    });
  }
  
  await browser.close();
  
  console.table(results);
  return results;
}
async function runAllPerformanceTests() {
  console.log('\n=== PERFORMANCE TEST SUITE ===\n');
  
  console.log('1. API Response Time Test:');
  await testResponseTime();
  
  console.log('\n2. Database Performance Test:');
  await testDatabasePerformance();
  
  console.log('\n3. Memory Usage Test:');
  testMemoryUsage();
  
  console.log('\n4. Concurrent Users Test (100 users):');
  await testConcurrentUsers(100);
  
  console.log('\n5. Page Load Time Test:');
  await testPageLoadTime();
  
  console.log('\n=== PERFORMANCE TEST COMPLETED ===\n');
}

module.exports = {
  testResponseTime,
  testDatabasePerformance,
  testMemoryUsage,
  testConcurrentUsers,
  testPageLoadTime,
  runAllPerformanceTests
};

// Chạy nếu file được execute trực tiếp
if (require.main === module) {
  runAllPerformanceTests().catch(console.error);
}