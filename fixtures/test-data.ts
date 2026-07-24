/**
 * Shared Sauce Demo credentials and catalog constants.
 * Demo accounts are published on https://www.saucedemo.com/
 */

export const PASSWORD = 'secret_sauce' as const;

export const USERS = {
  standard: {
    username: 'standard_user',
    password: PASSWORD,
  },
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
  },
  problem: {
    username: 'problem_user',
    password: PASSWORD,
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
  },
} as const;

export type UserKey = keyof typeof USERS;

export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

/** Expected inventory catalog (A→Z by name). */
export const EXPECTED_PRODUCTS = [
  PRODUCTS.backpack,
  PRODUCTS.bikeLight,
  PRODUCTS.boltTShirt,
  PRODUCTS.fleeceJacket,
  PRODUCTS.onesie,
  PRODUCTS.redTShirt,
] as const;

export const CHECKOUT_INFO = {
  firstName: 'Jane',
  lastName: 'Doe',
  postalCode: '10001',
} as const;
