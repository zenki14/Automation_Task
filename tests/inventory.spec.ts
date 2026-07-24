import {
  test,
  expect,
  PRODUCTS,
  EXPECTED_PRODUCTS,
} from '../fixtures/auth.fixture';

test.describe('Inventory', () => {
  test('product list is visible and contains expected items', async ({
    authenticatedInventory,
  }) => {
    await expect(authenticatedInventory.inventoryList).toBeVisible();
    await expect(authenticatedInventory.inventoryItems).toHaveCount(
      EXPECTED_PRODUCTS.length,
    );

    const names = await authenticatedInventory.getProductNames();
    for (const product of EXPECTED_PRODUCTS) {
      expect(names).toContain(product);
    }
  });

  test('sorting works for name and price options', async ({
    authenticatedInventory,
  }) => {
    await authenticatedInventory.sortBy('Name (A to Z)');
    const nameAsc = await authenticatedInventory.getProductNames();
    expect(nameAsc).toEqual([...nameAsc].sort((a, b) => a.localeCompare(b)));

    await authenticatedInventory.sortBy('Name (Z to A)');
    const nameDesc = await authenticatedInventory.getProductNames();
    expect(nameDesc).toEqual(
      [...nameAsc].sort((a, b) => b.localeCompare(a)),
    );

    await authenticatedInventory.sortBy('Price (low to high)');
    const pricesLowHigh = await authenticatedInventory.getProductPrices();
    expect(pricesLowHigh).toEqual(
      [...pricesLowHigh].sort((a, b) => a - b),
    );

    await authenticatedInventory.sortBy('Price (high to low)');
    const pricesHighLow = await authenticatedInventory.getProductPrices();
    expect(pricesHighLow).toEqual(
      [...pricesLowHigh].sort((a, b) => b - a),
    );
  });

  test('adding a single product updates the cart badge to 1', async ({
    authenticatedInventory,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.backpack);
    await authenticatedInventory.expectCartBadgeCount(1);
  });

  test('adding multiple products updates the cart badge correctly', async ({
    authenticatedInventory,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.backpack);
    await authenticatedInventory.addToCart(PRODUCTS.bikeLight);
    await authenticatedInventory.addToCart(PRODUCTS.onesie);
    await authenticatedInventory.expectCartBadgeCount(3);
  });

  test('removing a product from inventory decreases the badge', async ({
    authenticatedInventory,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.backpack);
    await authenticatedInventory.addToCart(PRODUCTS.bikeLight);
    await authenticatedInventory.expectCartBadgeCount(2);

    await authenticatedInventory.removeFromCart(PRODUCTS.backpack);
    await authenticatedInventory.expectCartBadgeCount(1);
  });
});
