import {Page} from 'puppeteer';

async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function readInputValue(page: Page, selector: string): Promise<string|undefined> {
  const input = await page.$(selector);
  return await input?.evaluate((el) => (el as HTMLInputElement).value);
}

async function setInputAttr(page: Page, selector: string, attributeName: 'disabled' | 'readonly', attributeValue: boolean): Promise<void> {
  const input = await page.$(selector);
  await input?.evaluate((el, attributeName, attributeValue) => {
    if (attributeValue) {
      (el as HTMLInputElement).setAttribute(attributeName, '');
    } else {
      (el as HTMLInputElement).removeAttribute(attributeName);
    }
  }, attributeName, attributeValue);
}

async function checkTouchspinUpIsDisabled(page: Page, selector: string): Promise<boolean> {
  const input = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');

  return await input!.evaluate((el) => {
    return (el as HTMLInputElement).hasAttribute('disabled');
  });
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

async function countChangeWithValue(page: Page, expectedValue: string): Promise<number> {
  const expectedText = '#input_callbacks: change[' + expectedValue + ']';
  return await page.evaluate((text) => {
    return Array.from(document.querySelectorAll('#events_log'))
      .filter(element => element.textContent!.includes(text)).length;
  }, expectedText);
}

async function countEvent(page: Page, selector: string, event: string): Promise<number> {
  // Get the event log content
  const eventLogContent = await page.$eval('#events_log', el => el.textContent);

  // Count the number of 'change' events with the expected value
  const searchString = selector + ': ' + event;
  return (eventLogContent ? eventLogContent.split(searchString).length - 1 : 0);
}

async function fillWithValue(page: Page, selector: string, value: string): Promise<void> {
  await page.focus(selector);
  // Has to be triple click to select all text when using decorators
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.type(value);
}

export default { waitForTimeout, readInputValue, setInputAttr, checkTouchspinUpIsDisabled, touchspinClickUp, changeEventCounter, countEvent, countChangeWithValue, fillWithValue };
