import { type Locator, type Page, expect } from '@playwright/test';

export type CheckoutInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

/**
 * Checkout flow: information → overview → complete.
 */
export class CheckoutPage {
  readonly page: Page;
  readonly infoTitle: Locator;
  readonly overviewTitle: Locator;
  readonly completeTitle: Locator;
  readonly completeHeader: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly backHomeButton: Locator;
  readonly errorMessage: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.infoTitle = page
      .locator('.title')
      .filter({ hasText: 'Checkout: Your Information' });
    this.overviewTitle = page
      .locator('.title')
      .filter({ hasText: 'Checkout: Overview' });
    this.completeTitle = page
      .locator('.title')
      .filter({ hasText: 'Checkout: Complete!' });
    this.completeHeader = page.getByRole('heading', {
      name: 'Thank you for your order!',
    });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
    this.errorMessage = page.getByTestId('error');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectInfoStepLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(this.infoTitle).toBeVisible();
  }

  async expectOverviewLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(this.overviewTitle).toBeVisible();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-complete\.html/);
    await expect(this.completeTitle).toBeVisible();
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async expectValidationError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.cartBadge).toHaveCount(0);
  }
}
