/** Open a grouped destination through its real visible control. */
export async function openNavigationGroup(page, name) {
  const summary = page.locator('.navigation-group > summary').filter({ hasText: new RegExp(`^${name}$`) });
  if (await summary.count() && !(await summary.evaluate((element) => element.parentElement.open))) await summary.click();
}
export async function openMapDisplay(page) {
  const summary = page.locator('.map-display-options > summary');
  await summary.waitFor();
  if (!(await summary.evaluate((element) => element.parentElement.open))) await summary.click();
  await page.locator('.map-display-fields').waitFor({ state: 'visible' });
}
