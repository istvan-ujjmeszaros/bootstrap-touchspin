import { Page } from 'puppeteer';

async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function touchspinClick(page: Page, selector: string): Promise<void> {
  await page.evaluate((selector) => {
    document.querySelector(selector)!.dispatchEvent(new Event('mousedown'));
  }, selector);

  // Delay to allow the value to change.
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate((selector) => {
    document.querySelector(selector)!.dispatchEvent(new Event('mouseup'));
  }, selector);
}

async function touchspinClickUp(page: Page, input_selector: string): Promise<void> {
  await page.evaluate((selector) => {
    document.querySelector(selector)!.dispatchEvent(new Event('mousedown'));
  }, input_selector + ' + .input-group-btn > .bootstrap-touchspin-up');

  // Delay to allow the value to change.
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate((selector) => {
    document.querySelector(selector)!.dispatchEvent(new Event('mouseup'));
  }, input_selector + ' + .input-group-btn > .bootstrap-touchspin-up');
}

async function changeEventCounter(page: Page): Promise<number> {
  // Get the event log content
  const eventLogContent = await page.$eval('#events_log', el => el.textContent);

  // Count the number of 'change' events
  return (eventLogContent?.match(/change\[/g) ?? []).length;
}

export default { waitForTimeout, touchspinClick, touchspinClickUp, changeEventCounter };
