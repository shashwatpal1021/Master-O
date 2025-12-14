// e2e.js - lightweight Puppeteer test for basic create/edit flow
import puppeteer from 'puppeteer';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5175';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpass123';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  try {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle2' });
    // login
    await page.type('input[type=email]', ADMIN_EMAIL);
    await page.type('input[type=password]', ADMIN_PASS);
    await Promise.all([
      page.click('button[type=submit]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Wait for dashboard
    await page.waitForSelector('h1');
    const h1 = await page.$eval('h1', el => el.textContent || '');
    if (!h1.includes('Dashboard')) throw new Error('Did not land on Dashboard');

    // Open create task modal
    const openBtn = await page.$x("//button[contains(., 'Open Create Task')]");
    if (!openBtn || openBtn.length === 0) throw new Error('Open Create Task button not found');
    await openBtn[0].click();

    // Fill form
    await page.waitForSelector('input[placeholder="Title"]');
    const title = 'E2E Task ' + Date.now();
    await page.type('input[placeholder="Title"]', title);
    await page.type('textarea[placeholder="Description"]', 'multi word description test');

    // Submit create
    const submitBtn = await page.$x("//div[contains(@class,'modal-card')]//button[contains(., 'Create') or contains(., 'Save')]");
    if (!submitBtn || submitBtn.length === 0) throw new Error('Modal submit button not found');
    await submitBtn[0].click();

    // Wait for task to appear in list
    await page.waitForXPath(`//div[contains(@class,'task-card')][.//div[contains(., '${title}')]]`, { timeout: 10000 });

    // Click Edit button for that task
    const editBtn = await page.$x(`//div[contains(@class,'task-card')][.//div[contains(., '${title}')]]//button[contains(., 'Edit')]`);
    if (!editBtn || editBtn.length === 0) throw new Error('Edit button not found');
    await editBtn[0].click();

    // Wait for inline inputs
    const inlineTextareaXPath = `//div[contains(@class,'task-card')][.//div[contains(., '${title}')]]//textarea`;
    await page.waitForXPath(inlineTextareaXPath, { timeout: 5000 });

    // Update description and save
    const newDesc = 'Updated by E2E';
    const descHandle = (await page.$x(inlineTextareaXPath))[0];
    await descHandle.click({ clickCount: 3 });
    await descHandle.type(newDesc);

    const saveBtn = await page.$x(`//div[contains(@class,'task-card')][.//div[contains(., '${title}')]]//button[contains(., 'Save')]`);
    if (!saveBtn || saveBtn.length === 0) throw new Error('Inline Save button not found');
    await saveBtn[0].click();

    // Verify updated description
    await page.waitForFunction((t, d) => {
      const cards = Array.from(document.querySelectorAll('.task-card'));
      return cards.some(c => c.textContent && c.textContent.includes(t) && c.textContent.includes(d));
    }, { timeout: 8000 }, title, newDesc);

    console.log('E2E PASSED');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E FAILED', err);
    await browser.close();
    process.exit(1);
  }
})();
