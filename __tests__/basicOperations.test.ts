import touchspinHelpers from './helpers/touchspinHelpers';
import {page} from './helpers/jestPuppeteerServerSetup';

describe('Core functionality', () => {

  it('should have a TouchSpin button', async () => {
    const button = await page.$('#testinput1 + .input-group-btn > .bootstrap-touchspin-up');
    expect(button).toBeTruthy();
  });

});
