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

module.exports = { touchspinClick };
