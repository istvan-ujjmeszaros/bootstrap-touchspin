const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const touchspinHelpers = require('./helpers/touchspin-helpers');

const puppeteerDebug = process.env.PUPPETEER_DEBUG === '1';

const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, '..')));

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}...`);
});

describe('TouchSpin Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    if (puppeteerDebug)  {
      browser = await puppeteer.launch({
        headless: false,
        slowMo: 300
      });
    } else {
      browser = await puppeteer.launch();
    }
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.close();
  });

  it('should have a TouchSpin button', async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index.html`);

    const button = await page.$('#testinput1 + .input-group-btn > .bootstrap-touchspin-up');
    expect(button).toBeTruthy();
  });

  it('should increase value by 1 when clicking the + button', async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index.html`);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, "#testinput1");

    const input = await page.$('#testinput1');
    const value = await input.evaluate(el => el.value);

    expect(value).toBe('51');
  });

  it('should fire the change event only once when updating the value', async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index.html`);

    await page.waitForSelector('#testinput1 + .input-group-btn > .bootstrap-touchspin-up');

    // Trigger the TouchSpin button
    await touchspinHelpers.touchspinClickUp(page, "#testinput1");

    // Wait for a period to ensure all events are processed (the click event is waiting for 200ms, so we are using a larger value to be on the safe side)
    await page.waitForTimeout(300);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('should fire the change event only once when updating the value using the keyboard and pressing TAB', async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index.html`);

    // Focus on the input element
    await page.focus('#testinput1');

    // Clear the input
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Type a new value
    await page.keyboard.type('45');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await page.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Reproducing #83', async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index.html`);

    // Focus on the input element
    await page.focus('#testinput2');

    // Clear the input
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Type a new value
    await page.keyboard.type('7');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await page.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });
});
