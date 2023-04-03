import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Core functionality', () => {

  it('should have a TouchSpin button', async () => {
    const selector: string = '#testinput1';

    const button = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');
    expect(button).toBeTruthy();
  });

});
