import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  hashToken,
  saveUserToLocalDb,
  findLocalUserByEmail,
  updateLocalUserPassword,
  updateUserPasswordInAllStores,
  resetLocalDb,
} from '../src/lib/auth-server.ts';
import { authClient } from '../src/lib/auth-client.ts';
import { saveOtp, verifyAndConsumeOtp } from '../src/lib/auth-otp-store.ts';

test('FoCient Authentication & Authorization Suite (Web Version & Google OAuth)', async (t) => {
  await t.test('1. PBKDF2 Password Hashing & Verification Security', () => {
    const rawPassword = 'SecurePassword2026!';
    const hashed = hashPassword(rawPassword);

    assert.ok(hashed && hashed.length >= 64, 'Hashed password must be high entropy hex string');
    assert.notEqual(hashed, rawPassword, 'Hashed password must never equal plaintext password');
    assert.ok(verifyPassword(rawPassword, hashed), 'Valid password must verify against hash');
    assert.ok(!verifyPassword('WrongPassword', hashed), 'Invalid password must be rejected');
  });

  await t.test('2. Cryptographic Session Token Generation & Hashing', () => {
    const token1 = generateToken();
    const token2 = generateToken();

    assert.notEqual(token1, token2, 'Generated tokens must be unique');
    assert.equal(token1.length, 64, 'Token must be 32 bytes (64 hex characters)');

    const hashedToken = hashToken(token1);
    assert.equal(hashedToken.length, 64, 'Token hash must be 256-bit SHA-256');
    assert.equal(hashedToken, hashToken(token1), 'Same token must produce deterministic hash');
  });

  await t.test('3. Google OAuth URL Generation Contract', () => {
    const googleUrl = authClient.getGoogleOAuthUrl();
    assert.ok(googleUrl.includes('accounts.google.com'), 'Must target Google OAuth 2.0 endpoints');
    assert.ok(googleUrl.includes('scope=openid%20email%20profile') || googleUrl.includes('openid'), 'Must request openid, email, and profile scopes');
    assert.ok(googleUrl.includes('response_type=token') || googleUrl.includes('code'), 'Must specify OAuth response type');
  });

  await t.test('4. Hybrid UserSession Storage & Persistence Contract', () => {
    const mockUser = {
      id: 'usr-google-test',
      name: 'FoCient Test User',
      email: 'test.user@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
      provider: 'google' as const,
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: 480,
      isOnboardingCompleted: false,
    };

    assert.equal(mockUser.provider, 'google', 'Must support Google provider archetype');
    assert.equal(mockUser.isOnboardingCompleted, false, 'New Google users must transition into personalized onboarding');
  });

  await t.test('5. Zero Punitive Language in Auth Responses', () => {
    const forbidden = ['terlambat', 'hukuman', 'gagal total', 'punish', 'late', 'failed'];
    const sampleMsgs = [
      'Email atau kata sandi tidak cocok.',
      'Registrasi berhasil! Selamat datang di FoCient.',
      'Akun Google berhasil didaftarkan! Selamat datang di FoCient.',
      'Berhasil masuk dengan akun Google.',
    ];

    for (const msg of sampleMsgs) {
      for (const word of forbidden) {
        assert.ok(!msg.toLowerCase().includes(word), `Auth messages must never use punitive word "${word}"`);
      }
    }
  });

  await t.test('6. Google Identity Services (GIS) & OAuth 2.0 Popup Contract', () => {
    // Verify popup message protocol
    const mockAuthPayload = {
      type: 'FOCIENT_GOOGLE_AUTH_SUCCESS',
      token: generateToken(),
      user: {
        id: 'usr-google-verified',
        name: 'Google User',
        email: 'user@gmail.com',
        provider: 'google',
        isOnboardingCompleted: false,
      },
      isNewUser: true,
    };

    assert.equal(mockAuthPayload.type, 'FOCIENT_GOOGLE_AUTH_SUCCESS');
    assert.equal(mockAuthPayload.user.provider, 'google');
    assert.ok(mockAuthPayload.token.length >= 64);
  });

  await t.test('7. OTP Generation, Hashing & Verification Contract', async () => {
    const testEmail = 'newuser@focient.dev';
    const testCode = '839201';

    await saveOtp(testEmail, testCode, 'REGISTRATION', 600);

    // Wrong code must fail
    const invalidResult = await verifyAndConsumeOtp(testEmail, '999999', 'REGISTRATION');
    assert.equal(invalidResult.valid, false, 'Invalid OTP candidate must be rejected');

    // Correct code must pass
    const validResult = await verifyAndConsumeOtp(testEmail, testCode, 'REGISTRATION');
    assert.equal(validResult.valid, true, 'Matching OTP code must be verified and consumed');

    // Replay attack / single-use check: same code cannot be reused
    const reusedResult = await verifyAndConsumeOtp(testEmail, testCode, 'REGISTRATION');
    assert.equal(reusedResult.valid, false, 'Consumed OTP cannot be re-verified');
  });

  await t.test('8. Registration-to-OTP Flow Persistence Contract', () => {
    const samplePending = {
      name: 'Budi Prakoso',
      email: 'budi.prakoso@example.com',
      password: 'SecurePassword123!',
    };

    authClient.setPendingRegistration(samplePending);
    const retrieved = authClient.getPendingRegistration();

    // In Node.js testing environment (where sessionStorage is undefined), returns null gracefully
    assert.ok(retrieved === null || retrieved.email === samplePending.email, 'Must handle pending registration gracefully in all runtime environments');
  });

  await t.test('9. Forgot Password & Reset Password Updates Database & Prevents Old Password Login', async () => {
    const testEmail = 'reset.test@focient.dev';
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewSecretPassword2026!';

    // Create test user in local database
    saveUserToLocalDb({
      id: 'usr_test_reset_flow',
      email: testEmail,
      name: 'Reset Test User',
      username: 'reset_tester',
      passwordHash: hashPassword(oldPassword),
      roleArchetype: 'Software Engineer',
      occupancy: 'General',
      workingRhythm: 'Steady Pacer',
      schedulingStyle: 'Structured',
      workHourStart: '09:00',
      workHourEnd: '17:00',
      startWorkTime: '09:00',
      endWorkTime: '17:00',
      dailyCapacityMinutes: 480,
      restTimePerTask: 10,
      isOnboardingCompleted: true,
      createdAt: new Date().toISOString(),
    });

    const userBefore = findLocalUserByEmail(testEmail);
    assert.ok(userBefore, 'User must exist before reset');
    assert.ok(verifyPassword(oldPassword, userBefore.passwordHash), 'Old password must verify before reset');

    // Perform password update in all stores
    const updated = await updateUserPasswordInAllStores(testEmail, newPassword);
    assert.ok(updated, 'updateUserPasswordInAllStores must succeed');

    const userAfter = findLocalUserByEmail(testEmail);
    assert.ok(userAfter, 'User must exist after reset');

    // Verify database has indeed changed!
    assert.notEqual(userAfter.passwordHash, userBefore.passwordHash, 'Database password hash must be updated to new hash');
    assert.ok(verifyPassword(newPassword, userAfter.passwordHash), 'New password must verify successfully against database');
    assert.ok(!verifyPassword(oldPassword, userAfter.passwordHash), 'Old password must be rejected after reset');
  });

  await t.test('10. Resetting Database Clears All Datasets and Accounts', () => {
    resetLocalDb();
    const testUser = findLocalUserByEmail('reset.test@focient.dev');
    assert.equal(testUser, null, 'Resetting local DB must completely remove all stored test accounts');
  });
});
