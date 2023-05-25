import express from 'express';
import path from 'path';
import puppeteer, {Browser, Page} from "puppeteer";

const puppeteerDebug = process.env.PUPPETEER_DEBUG === '1';

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, '../..')));

let server: any;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = app.listen(port, () => {
    console.log(`Express server listening on port ${port}...`);
  });

  if (puppeteerDebug)  {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 300,
      devtools: true,
    });
  } else {
    browser = await puppeteer.launch({
      headless: 'new',
    });
  }
});

afterAll(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  if (!page) {
    // Create a new page if it doesn't exist
    page = await browser.newPage();
  }

  await page.goto(`http://localhost:${port}/__tests__/html/index-bs4.html`);
});

export { page, port };
