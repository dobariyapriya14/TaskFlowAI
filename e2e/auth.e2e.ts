import { by, device, element, expect, waitFor } from 'detox';

describe('Authentication Flow E2E', () => {
  const testEmail = `user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  it('should navigate from Login to Signup screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await element(by.id('navigate-signup-button')).tap();
    await expect(element(by.id('signup-screen'))).toBeVisible();
  });

  it('should navigate back to Login screen from Signup', async () => {
    await element(by.id('navigate-login-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should allow user to enter credentials on Login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await element(by.id('login-email-input')).replaceText(testEmail);
    await element(by.id('login-password-input')).replaceText(testPassword);
  });

  it('should allow user signup with email and password and reach Home', async () => {
    await element(by.id('navigate-signup-button')).tap();
    await expect(element(by.id('signup-screen'))).toBeVisible();
    await element(by.id('signup-name-input')).replaceText('John Doe');
    await element(by.id('signup-email-input')).replaceText(testEmail);
    await element(by.id('signup-password-input')).replaceText(testPassword);
    await element(by.id('signup-confirm-password-input')).replaceText(
      testPassword,
    );
    await element(by.id('signup-submit-button')).tap();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(30000);
  });
});
