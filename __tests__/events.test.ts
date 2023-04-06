import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Events', () => {

  it('should increase value by 1 when clicking the + button', async () => {
    const selector: string = '#testinput_default';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
  });

  it('should fire the change event only once when updating the value', async () => {
    const selector: string = '#testinput_default';

    // Trigger the TouchSpin button
    await touchspinHelpers.touchspinClickUp(page, selector);

    // Wait for a period to ensure all events are processed (the click event is waiting for 200ms, so we are using a larger value to be on the safe side)
    await touchspinHelpers.waitForTimeout(300);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('should fire the change event exactly once when entering a proper value and pressing TAB', async () => {
    const selector: string = '#testinput_default';

    // Focus on the input element
    await page.focus(selector);

    // Clear the input
    await page.click(selector, { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing TAB', async () => {
    const selector: string = '#testinput_step10_min';

    // Focus on the input element
    await page.focus(selector);

    // Clear the input
    await page.click(selector, { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing Enter', async () => {
    const selector: string = '#testinput_step10_min';

    // Focus on the input element
    await page.focus(selector);

    // Clear the input
    await page.click(selector, { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should not fire change event when already at max value and entering a higher value', async () => {
    const selector: string = '#testinput_step10_max';

    // Focus on the input element
    await page.focus(selector);

    // Clear the input
    await page.click(selector, { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('117');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, "100")).toBe(0);
  });

  it('Should not fire change event when already at min value and entering a lower value', async () => {
    const selector: string = '#testinput_step10_min';

    // Focus on the input element
    await page.focus(selector);

    // Clear the input
    await page.click(selector, { clickCount: 2 });

    // Type a new value
    await page.keyboard.type('-55');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, "0")).toBe(0);
  });

  it('Should use the callback on the initial value', async () => {
    const selector: string = '#input_callbacks';

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('$5,000.00');
  });
});
