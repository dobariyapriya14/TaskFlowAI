import { by, device, element, expect, waitFor } from 'detox';

describe('Task Management Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  it('should open task creation modal and add a new task', async () => {
    try {
      await expect(element(by.id('home-screen'))).toBeVisible();
    } catch {
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('navigate-signup-button')).tap();
      await element(by.id('signup-name-input')).replaceText('Test User');
      await element(by.id('signup-email-input')).replaceText(
        `e2e_${Date.now()}@example.com`,
      );
      await element(by.id('signup-password-input')).replaceText('Password123!');
      await element(by.id('signup-confirm-password-input')).replaceText(
        'Password123!',
      );
      await element(by.id('signup-submit-button')).tap();
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(30000);
    }

    await element(by.id('open-add-task-modal-button')).tap();
    await expect(element(by.id('task-modal'))).toBeVisible();

    await element(by.id('task-title-input')).replaceText('E2E Automated Task');
    await element(by.id('task-category-input')).replaceText('Testing');
    await element(by.id('task-priority-input')).replaceText('High');

    await element(by.id('save-task-button')).tap();

    // Verify modal closes and task list displays the task
    await expect(element(by.id('task-modal'))).not.toBeVisible();
    await expect(element(by.id('task-list'))).toBeVisible();
  });

  it('should dismiss modal when Cancel is tapped', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
    await element(by.id('open-add-task-modal-button')).tap();
    await expect(element(by.id('task-modal'))).toBeVisible();
    await element(by.id('cancel-task-button')).tap();
    await expect(element(by.id('task-modal'))).not.toBeVisible();
  });

  it('should allow user to log out from Home Screen', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
    await element(by.id('logout-button')).tap();
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
