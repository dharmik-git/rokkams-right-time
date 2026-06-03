import { chromium } from 'playwright';
console.log('Starting browser test...');

try {
  const browser = await chromium.launch({ headless: true });
  console.log('Browser launched successfully');
  
  const context = await browser.createContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  console.log('Page created');
  
  console.log('Navigating to http://localhost:3004');
  await page.goto('http://localhost:3004', { waitUntil: 'load', timeout: 15000 });
  console.log('Page loaded');
  
  await page.waitForSelector('main', { timeout: 5000 });
  console.log('Main content found');
  
  const path = 'mobile-390.png';
  await page.screenshot({ path });
  console.log(`Screenshot saved: ${path}`);
  
  await browser.close();
  console.log('Done!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
