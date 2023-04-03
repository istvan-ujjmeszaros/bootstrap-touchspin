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

});
