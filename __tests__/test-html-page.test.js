const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const touchspinHelpers = require('./helpers/touchspin-helpers');

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
    browser = await puppeteer.launch();
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
    await touchspinHelpers.touchspinClick(page, "#testinput1 + .input-group-btn > .bootstrap-touchspin-up");

    const input = await page.$('#testinput1');
    const value = await input.evaluate(el => el.value);

    expect(value).toBe('51');
  });
});
