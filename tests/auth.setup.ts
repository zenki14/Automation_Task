import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../fixtures/test-data';

const authDir = path.join(__dirname, '../playwright/.auth');
const authFile = path.join(authDir, 'standard_user.json');

 //One-time login that writes storageState for inventory + checkout projects.
 //Avoids repeating UI login in every authenticated spec
 
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await inventoryPage.expectLoaded();
  await expect(page).toHaveURL(/.*inventory\.html/);

  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: authFile });
});