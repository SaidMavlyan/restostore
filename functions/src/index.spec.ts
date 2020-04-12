import * as test from 'firebase-functions-test';
import 'mocha';
import * as sinon from 'sinon';
import * as configs from './test-data.spec';

console.log('_______________________');

const firebaseConfig = {
  databaseURL: 'https://restostore-7.firebaseio.com',
  projectId: 'restostore-7',
};

const testApp = test(firebaseConfig, '../firebase-service-key.private.json');

export let myFunctions;

before(async function () {
  this.timeout(15000);

  try {
    myFunctions = await import('./index');
    await configs.initTestData();
  } catch (e) {
    throw e;
  }
});

afterEach(() => {
  sinon.restore();
});

after(async () => {
  try {
    await configs.clearTestData();
    testApp.cleanup();
  } catch (e) {
    console.log('Failed to clean up test app', e);
  } finally {
    console.log('_______________________');
  }
});

describe('index.ts', () => {
  it.skip('should', () => {
  });
});
