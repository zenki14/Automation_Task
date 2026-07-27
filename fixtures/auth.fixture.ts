import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS } from './test-data';

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

type AuthFixtures = PageFixtures & {
  authenticatedInventory: InventoryPage;
  
  problemUserInventory: InventoryPage;
};


 //Shared fixtures: page objects + authenticated inventory entry points.
 //Inventory/checkout projects load storageState from playwright/.auth/.
 //Auth + problem-user specs run without storageState.
 
export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  authenticatedInventory: async ({ page, inventoryPage }, use) => {
    // When storageState is present, cookies/local session are already valid.
    // Always land on inventory so tests do not depend on the prior URL.
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },

  problemUserInventory: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await inventoryPage.expectLoaded();

    await use(inventoryPage);
  },
});

export { expect, USERS };
export {
  PRODUCTS,
  EXPECTED_PRODUCTS,
  CHECKOUT_INFO,
  PASSWORD,
} from './test-data';
