import { type Locator, type Page, expect } from '@playwright/test';

export type SortOption =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

/**
 * Inventory (Products) page.
 */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title').filter({ hasText: 'Products' });
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.inventoryList = page.getByTestId('inventory-container');
    this.inventoryItems = page.locator('.inventory_item');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html/);
    await expect(this.title).toBeVisible();
    await expect(this.inventoryList).toBeVisible();
  }

  itemByName(productName: string): Locator {
    return this.inventoryItems.filter({ hasText: productName });
  }

  async addToCart(productName: string): Promise<void> {
    await this.itemByName(productName)
      .getByRole('button', { name: 'Add to cart' })
      .click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.itemByName(productName)
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.productPrices.allTextContents();
    return texts.map((text) => Number.parseFloat(text.replace('$', '')));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async expectCartBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toBeVisible();
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
