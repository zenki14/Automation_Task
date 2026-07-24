import { test, expect, USERS } from '../fixtures/auth.fixture';

test.describe('Authentication', () => {
  test('successful login with standard_user lands on inventory', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user shows the correct error message', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectErrorMessage(
      /Epic sadface: Sorry, this user has been locked out\./i,
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('invalid username/password shows the correct error message', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login('invalid_user', 'wrong_password');

    await loginPage.expectErrorMessage(
      /Epic sadface: Username and password do not match any user in this service/i,
    );
  });
});
