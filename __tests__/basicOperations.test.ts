import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Core functionality', () => {

  it('should have a TouchSpin button', async () => {
    const selector: string = '#testinput1';

    const button = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');

    expect(button).toBeTruthy();
  });

  it('should increase value by 1 when clicking the + button', async () => {
    const selector: string = '#testinput1';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
  });

  it('should not increase value when clicking the + button with a disabled input', async () => {
    const selector: string = '#testinput1';

    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should not increase value when clicking the + button with a readonly input', async () => {
    const selector: string = '#testinput1';

    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('setting the input disabled should disable the touchspin buttons', async () => {
    const selector: string = '#testinput1';

    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('setting the input readonly should disable the touchspin buttons', async () => {
    const selector: string = '#testinput1';

    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });


});
