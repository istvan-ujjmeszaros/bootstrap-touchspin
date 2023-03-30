// We have to use the mousedown and mouseup events because the plugin is not handling the click event.
async function touchspinClick(page, selector) {
  await page.evaluate((selector) => {
    document.querySelector(selector).dispatchEvent(new Event('mousedown'));
  }, selector);

  // Delay to allow the value to change.
  await page.waitForTimeout(200);

  await page.evaluate((selector) => {
    document.querySelector(selector).dispatchEvent(new Event('mouseup'));
  }, selector);
}

async function touchspinClickUp(page, input_selector) {
  await page.evaluate((selector) => {
    document.querySelector(selector).dispatchEvent(new Event('mousedown'));
  }, input_selector + ' + .input-group-btn > .bootstrap-touchspin-up');

  // Delay to allow the value to change.
  await page.waitForTimeout(200);

  await page.evaluate((selector) => {
    document.querySelector(selector).dispatchEvent(new Event('mouseup'));
  }, input_selector + ' + .input-group-btn > .bootstrap-touchspin-up');
}

async function changeEventCounter(page) {
  // Get the event log content
  const eventLogContent = await page.$eval('#events_log', el => el.textContent);

  // Count the number of 'change' events
  return (eventLogContent.match(/change\[/g) || []).length;
}

module.exports = { touchspinClick, touchspinClickUp, changeEventCounter };
