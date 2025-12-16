/**
 * KIỂM THỬ KHẢ NĂNG SỬ DỤNG (Usability Testing)
 * Kiểm tra trải nghiệm người dùng, accessibility, responsive
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

/**
 * Test 1: Accessibility (A11y) Testing
 */
async function testAccessibility() {
  console.log('\n=== ACCESSIBILITY TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const pages = [
    { name: 'Home', url: 'http://localhost:3000/' },
    { name: 'Shop', url: 'http://localhost:3000/shop/all' },
    { name: 'Product Detail', url: 'http://localhost:3000/detail/1' },
    { name: 'Cart', url: 'http://localhost:3000/cart' },
    { name: 'Login', url: 'http://localhost:3000/signin' }
  ];
  
  const results = [];
  
  for (const { name, url } of pages) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Chạy axe-core accessibility scan
    const axeResults = await new AxePuppeteer(page).analyze();
    
    const violations = axeResults.violations;
    const criticalIssues = violations.filter(v => v.impact === 'critical').length;
    const seriousIssues = violations.filter(v => v.impact === 'serious').length;
    const moderateIssues = violations.filter(v => v.impact === 'moderate').length;
    const minorIssues = violations.filter(v => v.impact === 'minor').length;
    
    results.push({
      page: name,
      totalViolations: violations.length,
      critical: criticalIssues,
      serious: seriousIssues,
      moderate: moderateIssues,
      minor: minorIssues,
      status: criticalIssues === 0 && seriousIssues === 0 ? 'PASS' : 'FAIL'
    });
    
    // Log chi tiết violations
    if (violations.length > 0) {
      console.log(`\n${name} - Accessibility Issues:`);
      violations.slice(0, 3).forEach(v => {
        console.log(`  - [${v.impact.toUpperCase()}] ${v.help}`);
        console.log(`    ${v.helpUrl}`);
      });
    }
  }
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Test 2: Responsive Design Testing
 */
async function testResponsiveDesign() {
  console.log('\n=== RESPONSIVE DESIGN TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Small Mobile', width: 320, height: 568 }
  ];
  
  const testPages = [
    'http://localhost:3000/',
    'http://localhost:3000/shop/all',
    'http://localhost:3000/cart'
  ];
  
  const results = [];
  
  for (const { name, width, height } of devices) {
    await page.setViewport({ width, height });
    
    for (const url of testPages) {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Kiểm tra horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      // Kiểm tra overflow content
      const overflowElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let count = 0;
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth) count++;
        });
        return count;
      });
      
      // Kiểm tra font size
      const fontSizeIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('body *');
        let count = 0;
        elements.forEach(el => {
          const fontSize = window.getComputedStyle(el).fontSize;
          if (parseInt(fontSize) < 12) count++;
        });
        return count;
      });
      
      results.push({
        device: name,
        viewport: `${width}x${height}`,
        page: url.split('/').pop() || 'home',
        horizontalScroll: hasHorizontalScroll ? 'YES' : 'NO',
        overflowElements,
        smallFonts: fontSizeIssues,
        status: !hasHorizontalScroll && overflowElements === 0 ? 'PASS' : 'FAIL'
      });
    }
  }
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Test 3: Navigation & User Flow Testing
 */
async function testNavigation() {
  console.log('\n=== NAVIGATION TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  // Test 1: Main navigation links
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  const navigationLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, header a'));
    return links.map(link => ({
      text: link.textContent.trim(),
      href: link.href
    })).filter(l => l.text && l.href);
  });
  
  for (const link of navigationLinks.slice(0, 5)) {
    try {
      const response = await page.goto(link.href, { 
        waitUntil: 'networkidle2',
        timeout: 5000 
      });
      
      results.push({
        test: 'Navigation Link',
        link: link.text,
        url: link.href,
        status: response.status() === 200 ? 'PASS' : 'FAIL',
        responseCode: response.status()
      });
    } catch (error) {
      results.push({
        test: 'Navigation Link',
        link: link.text,
        url: link.href,
        status: 'FAIL',
        error: error.message
      });
    }
  }
  
  // Test 2: Shopping flow
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  try {
    // Step 1: Go to shop
    await page.click('a[href*="shop"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    results.push({
      test: 'Shopping Flow',
      step: 'Navigate to Shop',
      status: page.url().includes('shop') ? 'PASS' : 'FAIL'
    });
    
    // Step 2: Click product
    await page.click('a[href*="detail"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    results.push({
      test: 'Shopping Flow',
      step: 'View Product Detail',
      status: page.url().includes('detail') ? 'PASS' : 'FAIL'
    });
    
    // Step 3: Add to cart
    const addToCartBtn = await page.$('a.add-to-cart, button.add-to-cart');
    if (addToCartBtn) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
      
      results.push({
        test: 'Shopping Flow',
        step: 'Add to Cart',
        status: 'PASS'
      });
    }
    
    // Step 4: Go to cart
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle2' });
    
    const cartHasItems = await page.evaluate(() => {
      return document.querySelector('table tbody tr') !== null;
    });
    
    results.push({
      test: 'Shopping Flow',
      step: 'View Cart',
      status: cartHasItems ? 'PASS' : 'WARNING'
    });
    
  } catch (error) {
    results.push({
      test: 'Shopping Flow',
      step: 'Error',
      status: 'FAIL',
      error: error.message
    });
  }
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Test 4: Form Usability Testing
 */
async function testFormUsability() {
  console.log('\n=== FORM USABILITY TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  // Test Login Form
  await page.goto('http://localhost:3000/signin', { waitUntil: 'networkidle2' });
  
  // Test 1: Form labels
  const hasLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
    let labelCount = 0;
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label || input.placeholder) labelCount++;
    });
    return { total: inputs.length, withLabels: labelCount };
  });
  
  results.push({
    test: 'Form Labels',
    page: 'Login',
    totalInputs: hasLabels.total,
    withLabels: hasLabels.withLabels,
    status: hasLabels.total === hasLabels.withLabels ? 'PASS' : 'FAIL'
  });
  
  // Test 2: Error messages visibility
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  const errorMessages = await page.evaluate(() => {
    const errors = document.querySelectorAll('[style*="color: red"], .error, .text-danger');
    return {
      count: errors.length,
      visible: Array.from(errors).every(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
    };
  });
  
  results.push({
    test: 'Error Messages',
    page: 'Login',
    errorCount: errorMessages.count,
    allVisible: errorMessages.visible,
    status: errorMessages.count > 0 && errorMessages.visible ? 'PASS' : 'FAIL'
  });
  
  // Test 3: Input field accessibility
  const inputAccessibility = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    let accessible = 0;
    let total = inputs.length;
    
    inputs.forEach(input => {
      if (input.id || input.name || input.getAttribute('aria-label')) {
        accessible++;
      }
    });
    
    return { total, accessible };
  });
  
  results.push({
    test: 'Input Accessibility',
    page: 'Login',
    totalInputs: inputAccessibility.total,
    accessible: inputAccessibility.accessible,
    status: inputAccessibility.total === inputAccessibility.accessible ? 'PASS' : 'FAIL'
  });
  
  // Test Register Form
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
  
  // Test 4: Password field visibility toggle
  const hasPasswordToggle = await page.evaluate(() => {
    return document.querySelector('button[type="button"]') !== null ||
           document.querySelector('[class*="eye"]') !== null;
  });
  
  results.push({
    test: 'Password Visibility Toggle',
    page: 'Register',
    hasToggle: hasPasswordToggle,
    status: hasPasswordToggle ? 'PASS' : 'WARNING'
  });
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Test 5: Loading & Feedback Testing
 */
async function testLoadingFeedback() {
  console.log('\n=== LOADING & FEEDBACK TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  // Test 1: Loading indicators
  await page.goto('http://localhost:3000/shop/all', { waitUntil: 'domcontentloaded' });
  
  const hasLoadingIndicator = await page.evaluate(() => {
    return document.querySelector('.loading, .spinner, [class*="load"]') !== null ||
           document.textContent.includes('Loading');
  });
  
  results.push({
    test: 'Loading Indicator',
    page: 'Shop',
    hasIndicator: hasLoadingIndicator,
    status: hasLoadingIndicator ? 'PASS' : 'WARNING'
  });
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Test 2: Success messages
  await page.goto('http://localhost:3000/detail/1', { waitUntil: 'networkidle2' });
  
  // Add to cart và kiểm tra feedback
  const addToCartBtn = await page.$('a.add-to-cart, button.add-to-cart');
  if (addToCartBtn) {
    await addToCartBtn.click();
    await page.waitForTimeout(1500);
    
    const hasSuccessMessage = await page.evaluate(() => {
      return document.querySelector('.modal_success, .alert-success, [class*="success"]') !== null;
    });
    
    results.push({
      test: 'Success Feedback',
      action: 'Add to Cart',
      hasFeedback: hasSuccessMessage,
      status: hasSuccessMessage ? 'PASS' : 'FAIL'
    });
  }
  
  // Test 3: Empty state messages
  await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle2' });
  
  // Clear cart
  await page.evaluate(() => {
    localStorage.setItem('carts', JSON.stringify([]));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  
  const hasEmptyStateMessage = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes('empty') || 
           text.includes('No items') || 
           text.includes('Không có sản phẩm');
  });
  
  results.push({
    test: 'Empty State Message',
    page: 'Cart',
    hasMessage: hasEmptyStateMessage,
    status: hasEmptyStateMessage ? 'PASS' : 'WARNING'
  });
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Test 6: Search Functionality Usability
 */
async function testSearchUsability() {
  console.log('\n=== SEARCH USABILITY TEST ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  // Test 1: Search box visibility
  const searchBox = await page.$('input[type="text"][placeholder*="search"], input[type="search"]');
  
  results.push({
    test: 'Search Box Visibility',
    visible: searchBox !== null,
    status: searchBox !== null ? 'PASS' : 'FAIL'
  });
  
  if (searchBox) {
    // Test 2: Search autocomplete/suggestions
    await searchBox.type('test', { delay: 100 });
    await page.waitForTimeout(1000);
    
    const hasSuggestions = await page.evaluate(() => {
      return document.querySelector('[class*="suggestion"], [class*="autocomplete"], .dropdown') !== null;
    });
    
    results.push({
      test: 'Search Suggestions',
      hasSuggestions,
      status: hasSuggestions ? 'PASS' : 'WARNING'
    });
    
    // Test 3: Search results display
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const hasResults = await page.evaluate(() => {
      return document.querySelector('.product, .item, [class*="product"]') !== null;
    });
    
    const hasNoResultsMessage = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('no results') || 
             text.includes('không tìm thấy') ||
             text.includes('no products');
    });
    
    results.push({
      test: 'Search Results Display',
      hasResults: hasResults || hasNoResultsMessage,
      status: hasResults || hasNoResultsMessage ? 'PASS' : 'FAIL'
    });
  }
  
  await browser.close();
  
  console.table(results);
  return results;
}

/**
 * Chạy tất cả usability tests
 */
async function runAllUsabilityTests() {
  console.log('\n========================================');
  console.log('   USABILITY TEST SUITE - STARTING');
  console.log('========================================\n');
  
  const allResults = [];
  
  try {
    allResults.push(await testAccessibility());
    allResults.push(await testResponsiveDesign());
    allResults.push(await testNavigation());
    allResults.push(await testFormUsability());
    allResults.push(await testLoadingFeedback());
    allResults.push(await testSearchUsability());
  } catch (error) {
    console.error('Error running usability tests:', error);
  }
  
  // Summary
  const flatResults = allResults.flat();
  const totalTests = flatResults.length;
  const passedTests = flatResults.filter(r => r.status === 'PASS').length;
  const failedTests = flatResults.filter(r => r.status === 'FAIL').length;
  const warnings = flatResults.filter(r => r.status === 'WARNING').length;
  
  console.log('\n========================================');
  console.log('   USABILITY TEST SUMMARY');
  console.log('========================================\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`\nUsability Score: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  return allResults;
}

module.exports = {
  testAccessibility,
  testResponsiveDesign,
  testNavigation,
  testFormUsability,
  testLoadingFeedback,
  testSearchUsability,
  runAllUsabilityTests
};

// Chạy nếu file được execute trực tiếp
if (require.main === module) {
  runAllUsabilityTests().catch(console.error);
}