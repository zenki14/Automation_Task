import {
  test,
  expect,
  PRODUCTS,
  CHECKOUT_INFO,
} from '../fixtures/auth.fixture';

test.describe('Checkout', () => {
  test('full happy-path purchase flow for two products', async ({
    authenticatedInventory,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.backpack);
    await authenticatedInventory.addToCart(PRODUCTS.bikeLight);
    await authenticatedInventory.expectCartBadgeCount(2);
    await authenticatedInventory.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItemVisible(PRODUCTS.backpack);
    await cartPage.expectItemVisible(PRODUCTS.bikeLight);
    await cartPage.expectItemCount(2);
    await cartPage.proceedToCheckout();

    await checkoutPage.expectInfoStepLoaded();
    await checkoutPage.fillCheckoutInfo(CHECKOUT_INFO);
    await checkoutPage.continue();

    await checkoutPage.expectOverviewLoaded();
    await checkoutPage.finish();

    await checkoutPage.expectOrderComplete();
    await checkoutPage.expectCartEmpty();

    await checkoutPage.backHome();
    await authenticatedInventory.expectLoaded();
    await authenticatedInventory.expectCartBadgeCount(0);
  });

  test('checkout form validation shows error when required fields are empty', async ({
    authenticatedInventory,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.onesie);
    await authenticatedInventory.openCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.expectInfoStepLoaded();
    await checkoutPage.continue();
    await checkoutPage.expectValidationError(/Error: First Name is required/i);
  });

  test('user can remove an item from the cart before checking out', async ({
    authenticatedInventory,
    cartPage,
  }) => {
    await authenticatedInventory.addToCart(PRODUCTS.backpack);
    await authenticatedInventory.addToCart(PRODUCTS.fleeceJacket);
    await authenticatedInventory.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItemCount(2);

    await cartPage.removeItem(PRODUCTS.backpack);
    await cartPage.expectItemCount(1);
    await cartPage.expectItemVisible(PRODUCTS.fleeceJacket);
    await expect(cartPage.itemByName(PRODUCTS.backpack)).toHaveCount(0);
  });
});
