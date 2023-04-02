import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Core functionality', () => {

  it('should have a TouchSpin button', async () => {
    const button = await page.$('#testinput1 + .input-group-btn > .bootstrap-touchspin-up');
    expect(button).toBeTruthy();
  });

  it('should increase value by 1 when clicking the + button', async () => {
    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, '#testinput1');

    const input = await page.$('#testinput1');
    const value = await input?.evaluate((el) => (el as HTMLInputElement).value);

    expect(value).toBe('51');
  });

  it('should not increase when clicking the + button with a disabled input', async () => {
    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, '#testinput1');

    const input = await page.$('#testinput1');
    const value = await input?.evaluate((el) => (el as HTMLInputElement).value);

    expect(value).toBe('51');
  });

  it('should not increase when clicking the + button with a readonly input', async () => {
    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, '#testinput1');

    const input = await page.$('#testinput1');
    const value = await input?.evaluate((el) => (el as HTMLInputElement).value);

    expect(value).toBe('51');
  });
});
