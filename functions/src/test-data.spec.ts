import * as admin from 'firebase-admin';
import { createTestUser } from './utils';

let isInitialized = false;

export let idToken;
export let userId;

export async function initTestData() {
  if (isInitialized) {
    return true;
  }

  try {
    const user = await createTestUser();
    idToken = user.idToken;
    userId = user.localId;
    isInitialized = true;
    return true;
  } catch (e) {
    console.log('Failed to init test data', e);
    throw e;
  }
}

export async function clearTestData() {
  if (!isInitialized) {
    return false;
  }

  try {
    await admin.auth().deleteUser(userId);
    isInitialized = false;
    return true;
  } catch (e) {
    console.log('Failed to clear test data', e);
    return false;
  }
}
