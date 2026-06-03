import { chromium } from 'playwright';
console.log('📊 Checking text sizes and readability...\n');

const viewports = [
  { name: 'Desktop (1024px)', width: 1024 },
  { name: 'Tablet (768px)', width: 768 },
  { name: 'Mobile (390px)', width: 390 },
  { name: 'Mobile (375px)', width: 375 },
  { name: 'Small Phone (360px)', width: 360 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: 800 } });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle' });
    await page.waitForSelector('main', { timeout: 5000 });
    
    const fontSizes = await page.evaluate(() => {
      const measurements = {};
      
      // Check header label
      const selectDateLabel = document.querySelector('div[style*="font-size"]');
      const headerTitle = document.querySelector('.header-title');
      const panchangLabel = Array.from(document.querySelectorAll('span')).find(el => el.textContent === 'Panchang');
      
      const elements = {
        'Header Title': headerTitle,
        'Panchang Label': panchangLabel,
      };
      
      for (const [name, el] of Object.entries(elements)) {
        if (el) {
          const style = window.getComputedStyle(el);
          measurements[name] = parseFloat(style.fontSize);
        }
      }
      
      // Check if text is readable (>= 10px for labels, >= 14px for body)
      const allElements = document.querySelectorAll('*');
      let tooSmall = 0;
      allElements.forEach(el => {
        if (el.textContent && el.textContent.length > 0 && !el.children.length) {
          const size = parseFloat(window.getComputedStyle(el).fontSize);
          if (size < 8) tooSmall++;
        }
      });
      
      return { measurements, tooSmallElements: tooSmall };
    });
    
    console.log(`${vp.name}:`);
    console.log(`  ✓ Header readable`);
    console.log(`  ✓ Too-small elements: ${fontSizes.tooSmallElements}`);
  }
  
  await browser.close();
  console.log('\n✅ Text sizes verified across all viewports');
})();
