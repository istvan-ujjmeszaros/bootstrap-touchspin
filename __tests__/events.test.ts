import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Events', () => {

  it('should increase value by 1 when clicking the + button', async () => {
    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, '#testinput1');

    const input = await page.$('#testinput1');
    const value = await input?.evaluate((el) => (el as HTMLInputElement).value);

    expect(value).toBe('51');
  });

  it('should fire the change event only once when updating the value', async () => {
    // Trigger the TouchSpin button
    await touchspinHelpers.touchspinClickUp(page, '#testinput1');

    // Wait for a period to ensure all events are processed (the click event is waiting for 200ms, so we are using a larger value to be on the safe side)
    await touchspinHelpers.waitForTimeout(300);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('should fire the change event only once when updating the value using the keyboard and pressing TAB', async () => {
    // Focus on the input element
    await page.focus('#testinput1');

    // Clear the input
    await page.click('#testinput1', { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('45');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing TAB', async () => {
    // Focus on the input element
    await page.focus('#testinput2');

    // Clear the input
    await page.click('#testinput2', { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('7');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing Enter', async () => {
    // Focus on the input element
    await page.focus('#testinput2');

    // Clear the input
    await page.click('#testinput2', { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('7');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });
});
