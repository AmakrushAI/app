import { test, expect } from '@playwright/test';

// This code will run before each test
test.beforeEach(async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');
  // Wait for the page title to load
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.title === 'ଆମ କୃଷି');
});

test('Login Page - Mobile input field', async ({ page }) => {
  console.log('1) Running test: Login Page - Mobile input field');
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    console.log('Mobile input field found successfully! ✅ ');
    const inputPlaceholder = await mobileNumberInput.getAttribute(
      'placeholder'
    );
    expect(inputPlaceholder).toBe('ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ |');
    console.log(
      'Mobile input field placeholder text matched successfully! ✅ '
    );
  } else {
    throw new Error('Mobile number input field not found.');
  }
});

test('Login Page - Less than 10 digits', async ({ page }) => {
  console.log('2) Running test: Login Page - Less than 10 digits');
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    // Enter less than 10 digits in the input field and click continue
    await mobileNumberInput.fill('123456789');
    const continueButton = await page.$('#login-continue-button');
    expect(await continueButton?.innerText()).toBe('ଜାରି ରଖ');
    await continueButton?.click();

    // Verify the URL remains same after clicking continue
    const currentURL = page.url();
    expect(currentURL).toBe('http://localhost:3000/login');
    console.log('Did not send OTP on entering less than 10 digits! ✅ ');
  } else {
    throw new Error('Mobile number input field not found.');
  }
});

test('Login Page - Send OTP', async ({ page }) => {
  console.log('3) Running test: Login Page - Send OTP');
  // Find the mobile number input field
  const mobileNumberInput = await page.$('#mobile-number-input');
  expect(mobileNumberInput).not.toBeNull(); // Assert that the input field exists

  if (mobileNumberInput) {
    console.log('Running test: Login Page - Send OTP');
    // Enter exactly 10 digits in the input field and click continue
    await mobileNumberInput.fill('9034350533');
    const continueButton = await page.$('#login-continue-button');
    await continueButton?.click();

    // Verify the URL after clicking continue
    const otpURL = new URL('http://localhost:3000/otp?state=9034350533');
    await page.waitForURL((url) => url.href.startsWith(otpURL.href));
    console.log('Successfully sent OTP on entering 10 digits! ✅ ');
  } else {
    throw new Error('Mobile number input field not found.');
  }
});
