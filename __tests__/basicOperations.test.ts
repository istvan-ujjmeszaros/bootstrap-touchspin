import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';
import {ElementHandle} from "puppeteer";

describe('Core functionality', () => {

  it('should have a TouchSpin button', async () => {
    const selector: string = '#testinput_default';

    const button = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');

    expect(button).toBeTruthy();
  });

  it('should increase value by 1 when clicking the + button', async () => {
    const selector: string = '#testinput_default';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
  });

  it('should not increase value of a disabled input', async () => {
    const selector: string = '#testinput_default';

    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);
    await page.keyboard.press('ArrowUp');
    await page.mouse.wheel({ deltaY: -100 });

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should not increase value of a readonly input', async () => {
    const selector: string = '#testinput_default';

    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    await page.click(selector);
    await page.keyboard.press('ArrowUp');
    await page.mouse.wheel({ deltaY: -100 });

    expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.startspin')).toBe(0);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('setting the input disabled should disable the touchspin buttons', async () => {
    const selector: string = '#testinput_default';

    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('setting the input readonly should disable the touchspin buttons', async () => {
    const selector: string = '#testinput_default';

    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('disabled input should initialize with disabled touchspin buttons', async () => {
    const selector: string = '#testinput_disabled';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('readonly input should initialize with disabled touchspin buttons', async () => {
    const selector: string = '#testinput_readonly';

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('clicking on an input with step=3 should increase the value by 3', async () => {
    const selector: string = '#testinput_individual_min_max_step_properties';

    // The initial value of 50 should be corrected to 51 by the browser as step = 3
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

    // We have to use the mousedown and mouseup events because the plugin is not handling the click event.
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('54');

    await touchspinHelpers.touchspinClickUp(page, selector);
    await touchspinHelpers.touchspinClickUp(page, selector);
    await touchspinHelpers.touchspinClickUp(page, selector);

    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('57');

    // Reaching 57 should fire the touchspin.on.max event three times (min is getting corrected to 45)
    expect(await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max')).toBe(3);
  });

  test("Bootstrap 3 should have input-group-sm class", async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index-bs3.html`);
    const selector: string = "#input_group_sm";
    const inputGroupClasses = await page.$eval(selector, (input: Element) => {
      const inputElement = input as HTMLInputElement;
      return inputElement.parentElement?.className;
    });
    expect(inputGroupClasses).toContain("input-group-sm");
  });

  test("Bootstrap 4 should have input-group-sm class", async () => {
    const selector: string = "#input_group_sm";
    const inputGroupClasses = await page.$eval(selector, (input: Element) => {
      const inputElement = input as HTMLInputElement;
      return inputElement.parentElement?.className;
    });
    expect(inputGroupClasses).toContain("input-group-sm");
  });

  test("Bootstrap 3 should have input-group-lg class", async () => {
    await page.goto(`http://localhost:${port}/__tests__/html/index-bs3.html`);
    const selector: string = "#input_group_lg";
    const inputGroupClasses = await page.$eval(selector, (input: Element) => {
      const inputElement = input as HTMLInputElement;
      return inputElement.parentElement?.className;
    });
    expect(inputGroupClasses).toContain("input-group-lg");
  });

  test("Bootstrap 4 should have input-group-lg class", async () => {
    const selector: string = "#input_group_lg";
    const inputGroupClasses = await page.$eval(selector, (input: Element) => {
      const inputElement = input as HTMLInputElement;
      return inputElement.parentElement?.className;
    });
    expect(inputGroupClasses).toContain("input-group-lg");
  });

});
