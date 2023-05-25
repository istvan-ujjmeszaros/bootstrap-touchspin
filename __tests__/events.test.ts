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

    await touchspinHelpers.fillWithValue(page, selector, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing TAB', async () => {
    const selector: string = '#testinput_step10_min';

    await touchspinHelpers.fillWithValue(page, selector, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Tab');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should fire the change event only once when correcting the value according to step after pressing Enter', async () => {
    const selector: string = '#testinput_step10_min';

    await touchspinHelpers.fillWithValue(page, selector, '67');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
  });

  it('Should not fire change event when already at max value and entering a higher value', async () => {
    const selector: string = '#testinput_step10_max';

    await touchspinHelpers.fillWithValue(page, selector, '117');

    // Press the TAB key to move out of the input field
    await page.keyboard.press('Enter');

    // Wait for a short period to ensure all events are processed
    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.changeEventCounter(page)).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, "100")).toBe(0);
  });

  it('Should not fire change event when already at min value and entering a lower value', async () => {
    const selector: string = '#testinput_step10_min';

    await touchspinHelpers.fillWithValue(page, selector, '-55');

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

  it('Should have the decorated value when firing the change event', async () => {
    const selector: string = '#input_callbacks';

    await touchspinHelpers.fillWithValue(page, selector, '1000');

    await page.keyboard.press('Enter');

    await touchspinHelpers.waitForTimeout(500);

    expect(await touchspinHelpers.countChangeWithValue(page, '$1,000.00')).toBe(1);
  });

  it('Should have the decorated value on blur', async () => {
    const selector: string = '#input_callbacks';

    await touchspinHelpers.fillWithValue(page, selector, '1000');

    await page.click('#input_group_lg', { clickCount: 1 });

    expect(await touchspinHelpers.countChangeWithValue(page, '1000')).toBe(0);
    expect(await touchspinHelpers.countChangeWithValue(page, '$1,000.00')).toBe(1);
  });

  it('The touchspin.on.min and touchspin.on.max events should fire as soon as the value reaches the minimum or maximum value', async () => {
    const selector: string = '#testinput_default';

    await touchspinHelpers.fillWithValue(page, selector, '1');
    await page.keyboard.press('ArrowDown');
    expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.min')).toBe(1);

    await touchspinHelpers.fillWithValue(page, selector, '99');
    await page.keyboard.press('ArrowUp');
    expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max')).toBe(1);
  });

});
