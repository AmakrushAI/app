import { test, expect } from '@playwright/test';

// This code will run before each test
test.beforeEach(async ({ page }, testInfo) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');
  // Wait for the page title to load
  await page.waitForFunction(() => document.title === 'ଆମ କୃଷି');

  testInfo.setTimeout(testInfo.timeout + 90000);
});

test('Login Page - Input Field', async ({ page }) => {
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    const inputPlaceholder = await mobileNumberInput.getAttribute('placeholder');
    expect(inputPlaceholder).toBe('ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ |');
  } else {
    throw new Error('Mobile number input field not found.');
  }
});

test('Login Page - Continue Button', async ({ page }) => {
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    // Enter less than 10 digits in the input field and click continue
    await mobileNumberInput.fill('123456789');
    const continueButton = await page.$('#login-continue-button');
    expect(await continueButton?.innerText()).toBe('ଜାରି ରଖ');
    await continueButton?.click();

    // Verify the URL after clicking continue
    const currentURL = page.url();
    expect(currentURL).toBe('http://localhost:3000/login');
  } else {
    throw new Error('Mobile number input field not found.');
  }
});

test('OTP Page - URL and Verification', async ({ page }) => {
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    // Enter exactly 10 digits in the input field and click continue
    await mobileNumberInput.fill('9034350533');
    const continueButton = await page.$('#login-continue-button');
    await continueButton?.click();

    // Verify the URL after clicking continue
    const otpURL = new URL('http://localhost:3000/otp?state=903435053');
    await page.waitForURL((url) => url.href.startsWith(otpURL.href));

    // Verify the new URL after clicking continue
    const updatedURL = page.url();
  } else {
    throw new Error('Mobile number input field not found.');
  }
});
