const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, '..')));

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}...`);
});

describe('Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({headless:false});
    page = await browser.newPage();
    await page.goto(`http://localhost:${port}/demo/index.html`);
  });

  afterAll(async () => {
    await browser.close();
    server.close();
  });

  it('should have a TouchSpin button', async () => {
    const button = await page.$('#demo0 + .input-group-btn > .bootstrap-touchspin-up');
    expect(button).toBeTruthy();
  });

  // Create a test that is clicking the + button.
  // Check if the initial value of 40 was changed to 41.
  it('should increase value by 1 when clicking the + button', async () => {
    await page.waitForSelector('#demo0 + .input-group-btn > .bootstrap-touchspin-up');
    const button = await page.$('#demo0 + .input-group-btn > .bootstrap-touchspin-up');

    await page.evaluate(() => {
      document.querySelector("#demo0 + .input-group-btn > .bootstrap-touchspin-up").dispatchEvent(new Event('mousedown'));
    });

    // Delay to allow the value to change.
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      document.querySelector("#demo0 + .input-group-btn > .bootstrap-touchspin-up").dispatchEvent(new Event('mouseup'));
    });

    const input = await page.$('#demo0');
    const value = await input.evaluate(el => el.value);

    expect(value).toBe('41');
  });
});
