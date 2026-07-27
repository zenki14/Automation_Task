import {
  test,
  expect,
  PRODUCTS,
  CHECKOUT_INFO,
} from '../fixtures/auth.fixture';

test.describe('problem_user negative scenarios', () => {
  test('product images are broken (404 assets) for every item', async ({
    problemUserInventory,
  }) => {
    const sources = await problemUserInventory.getProductImageSources();

    expect(sources.length).toBeGreaterThan(0);
    for (const src of sources) {
      expect(src).toMatch(/404/i);
    }

    // All products incorrectly share the same broken asset.
    expect(new Set(sources).size).toBe(1);
  });

  test('sorting by name Z to A does not reorder the product list', async ({
    problemUserInventory,
  }) => {
    await problemUserInventory.sortBy('Name (A to Z)');
    const ascending = await problemUserInventory.getProductNames();

    await problemUserInventory.sortBy('Name (Z to A)');
    const afterSort = await problemUserInventory.getProductNames();

    // Correct behavior would reverse the list; problem_user leaves order unchanged.
    expect(afterSort).toEqual(ascending);
    expect(afterSort).not.toEqual([...ascending].reverse());
  });

  test('Add to cart for Fleece Jacket does not update the cart badge', async ({
    problemUserInventory,
  }) => {
    await expect(
      problemUserInventory.addToCartButton(PRODUCTS.fleeceJacket),
    ).toBeVisible();

    await problemUserInventory.addToCart(PRODUCTS.fleeceJacket);

    // Button remains "Add to cart" and badge stays empty — known defect.
    await expect(
      problemUserInventory.addToCartButton(PRODUCTS.fleeceJacket),
    ).toBeVisible();
    await problemUserInventory.expectCartBadgeCount(0);
  });

  test('Remove does not work after adding Backpack to the cart', async ({
    problemUserInventory,
  }) => {
    await problemUserInventory.addToCart(PRODUCTS.backpack);
    await problemUserInventory.expectCartBadgeCount(1);
    await expect(
      problemUserInventory.removeButton(PRODUCTS.backpack),
    ).toBeVisible();

    await problemUserInventory.removeFromCart(PRODUCTS.backpack);

    // Remove is broken for problem_user: item stays in cart.
    await problemUserInventory.expectCartBadgeCount(1);
    await expect(
      problemUserInventory.removeButton(PRODUCTS.backpack),
    ).toBeVisible();
  });

  test('checkout cannot continue because last name never persists', async ({
    problemUserInventory,
    cartPage,
    checkoutPage,
  }) => {
    // Backpack add-to-cart still works for problem_user; fleece does not.
    await problemUserInventory.addToCart(PRODUCTS.backpack);
    await problemUserInventory.openCart();
    await cartPage.expectLoaded();
    await cartPage.proceedToCheckout();

    await checkoutPage.expectInfoStepLoaded();
    await checkoutPage.fillCheckoutInfo(CHECKOUT_INFO);

    // Known defect: last name is not retained (often mirrored into first name).
    await expect(checkoutPage.lastNameInput).toHaveValue('');
    await expect(checkoutPage.firstNameInput).not.toHaveValue('');

    await checkoutPage.continue();
    await checkoutPage.expectValidationError(/Last Name is required/i);
    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html/);
  });
});
