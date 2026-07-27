import { type Locator, type Page, expect } from '@playwright/test';

 //Shopping cart page
 
export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title').filter({ hasText: 'Your Cart' });
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', {
      name: 'Continue Shopping',
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.title).toBeVisible();
  }

  itemByName(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  async expectItemVisible(productName: string): Promise<void> {
    await expect(this.itemByName(productName)).toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async removeItem(productName: string): Promise<void> {
    await this.itemByName(productName)
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
