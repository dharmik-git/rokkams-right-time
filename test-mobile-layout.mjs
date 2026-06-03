import { chromium } from 'playwright';
console.log('🔍 Testing mobile layout...\n');

const viewports = [
  { name: 'Desktop', width: 1024, height: 768 },
  { name: 'Mobile-390', width: 390, height: 844 },
  { name: 'Mobile-375', width: 375, height: 667 },
  { name: 'Mobile-360', width: 360, height: 640 },
];

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    
    for (const vp of viewports) {
      console.log(`📱 ${vp.name} (${vp.width}x${vp.height}):`);
      
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      
      try {
        await page.goto('http://localhost:3004', { waitUntil: 'load', timeout: 15000 });
        await page.waitForSelector('main', { timeout: 5000 });
        await page.waitForTimeout(500);
        
        const issues = await page.evaluate(() => {
          const probs = [];
          
          const header = document.querySelector('header');
          if (header && header.scrollWidth > header.clientWidth) {
            probs.push('Header overflow');
          }
          
          const main = document.querySelector('main');
          if (main && main.scrollWidth > main.clientWidth) {
            probs.push('Main overflow');
          }
          
          return probs;
        });
        
        if (issues.length === 0) {
          console.log(`   ✅ No layout issues`);
        } else {
          console.log(`   ❌ Issues: ${issues.join(', ')}`);
        }
        
        const path = `./screenshots/${vp.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log(`   📸 Screenshot: ${path}`);
        
      } finally {
        await context.close();
      }
    }
    
    await browser.close();
    console.log('\n✅ All screenshots captured!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
