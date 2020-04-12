import { expect } from 'chai';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import 'mocha';
import * as sinon from 'sinon';
import { create, getUsers, patch, remove } from './controller';
import { Roles } from './roles';
import { signIn } from './utils';
import OrderByDirection = firebase.firestore.OrderByDirection;

describe('controller.ts', async function () {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const email = 'testEmail@example.com';
  const displayName = 'test display name';
  const role = Roles.user;
  let password = 'test1234';
  let db;

  const testReq = {
    headers: {},
    params: {},
    query: {},
    body: {
      displayName,
      email,
      password,
      role
    }
  };

  function newReq() {
    return JSON.parse(JSON.stringify(testReq));
  }

  function newRes() {
    return {
      status: sinon.stub(),
      send: sinon.stub()
    };
  }

  before(async function () {
    this.timeout(7000);

    db = admin.firestore();

    await admin.auth().getUserByEmail(email).then(async user => {
      await admin.auth().deleteUser(user.uid);
      await db.doc(`users/${user.uid}`).delete();
    }).catch(() => 'ignore if user is not found');
  });

  describe('create()', () => {

    beforeEach(() => {
      req = newReq();
      res = newRes();
    });

    it('should return 400 when email is missing', async () => {
      delete req.body.email;
      await create(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);
    });

    it('should return 400 when password is missing', async () => {
      delete req.body.password;
      await create(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);
    });

    it('should return 400 when displayName is missing', async () => {
      delete req.body.displayName;
      await create(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);
    });

    it('should return 400 when role is missing', async () => {
      delete req.body.role;
      await create(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);
    });

    it('should validate password', async function () {
      this.timeout(7000);
      req.body.password = 'short';

      await create(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);

      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Password/);
    });

    it('should create user in firebase auth', async function () {
      this.timeout(7000);
      await create(req as Request, res as Response);
      const response = (res.send as sinon.SinonStub).lastCall.args[0];

      sinon.assert.calledWith(res.status as sinon.SinonStub, 201);
      expect(response).ownProperty('uid');

      const docRef = await db.doc(`users/${response.uid}`).get();

      expect(docRef.data()).to.include({
        displayName: req.body.displayName,
        email: req.body.email,
        role: req.body.role
      });

      await admin.auth().deleteUser(response.uid);
      await db.doc(`users/${response.uid}`).delete();
    });

    it('should set role to custom claims', async function () {
      this.timeout(10000);
      await create(req as Request, res as Response);

      const {idToken} = await signIn(req.body.email, req.body.password);
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      expect(decodedToken).ownProperty('role').equals(req.body.role);

      await admin.auth().deleteUser(decodedToken.uid);
      await db.doc(`users/${decodedToken.uid}`).delete();
    });

  });

  describe('resetPassword()', () => {
    it('should reset password');
  });

  describe('get()', () => {
    it('should return user object');
    it('should return auth or firestore fail to return user');
  });

  describe('getUsers()', function () {

    const DEFAULT_LIMIT_PER_PAGE = 10;
    const NUMBER_OF_NEW_ENTRIES = 12;

    before(async function () {
      this.timeout(15000);
      const usersRef = await db.collection(`users`).get();

      for (let i = usersRef.size; i < NUMBER_OF_NEW_ENTRIES; i++) {
        await db.doc(`users/test${i}`).set({
          uid: `test${i}`,
          displayName: `testName ${i}`,
          email: `test${i}@example.com`,
          role: (i % 2) ? Roles.manager : Roles.user
        });
      }
    });

    beforeEach(() => {
      req = newReq();
      res = newRes();

      delete req.body;
    });

    after(async function () {
      this.timeout(15000);

      for (let i = 0; i < NUMBER_OF_NEW_ENTRIES; i++) {
        await db.doc(`users/test${i}`).delete();
      }
    });

    it('should return default number of users', async () => {
      await getUsers(req as Request, res as Response);

      const response = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(response.users.length).to.equal(DEFAULT_LIMIT_PER_PAGE);
      expect(response.totalSize).be.a('number');
    });

    it('should return 5 users, when limit is 5', async () => {
      req.query.limit = '5';
      await getUsers(req as Request, res as Response);

      const response = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(response.users.length).to.equal(5);
      expect(response.totalSize).be.a('number');
    });

    it('should return 10 users, when limit is -5', async () => {
      req.query.limit = '-5';
      await getUsers(req as Request, res as Response);

      const response = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(response.users.length).to.equal(DEFAULT_LIMIT_PER_PAGE);
    });

    it('should return 10 users, when limit is invalid string', async () => {
      req.query.limit = 'test';
      await getUsers(req as Request, res as Response);

      const response = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(response.users.length).to.equal(DEFAULT_LIMIT_PER_PAGE);
    });

    it('should return correct pagination results', async function () {

      req.query.limit = '4';
      await getUsers(req as Request, res as Response);
      const firstCallResults = (res.send as sinon.SinonStub).lastCall.args[0];

      req.query.limit = '2';
      req.query.page = '0';
      await getUsers(req as Request, res as Response);
      const firstPage = (res.send as sinon.SinonStub).lastCall.args[0];

      req.query.limit = '2';
      req.query.page = '1';
      await getUsers(req as Request, res as Response);
      const secondPage = (res.send as sinon.SinonStub).lastCall.args[0];

      expect(secondPage.totalSize).be.a('number');
      expect(firstCallResults.users).to.have.deep.members([...firstPage.users, ...secondPage.users]);
    });

    it('should sort by role in descending', async () => {
      req.query.sort = 'role:desc';
      await getUsers(req as Request, res as Response);

      const users = (res.send as sinon.SinonStub).lastCall.args[0].users;
      expect(users.length).equal(10);
      expect(isSortedByField(users, 'role', 'desc')).equal(true);
    });

    it('should sort by email in descending', async () => {
      req.query.sort = 'email:asc';
      await getUsers(req as Request, res as Response);

      const users = (res.send as sinon.SinonStub).lastCall.args[0].users;
      expect(users.length).equal(10);
      expect(isSortedByField(users, 'email', 'asc')).equal(true);
    });

    it('should sort by email in ascending', async () => {
      req.query.sort = 'email';
      await getUsers(req as Request, res as Response);

      const users = (res.send as sinon.SinonStub).lastCall.args[0].users;
      expect(users.length).equal(10);
      expect(isSortedByField(users, 'email', 'asc')).equal(true);
    });

    it('should return 500 when wrong direction is passed', async () => {
      req.query.sort = 'email:invalidDirection';
      await getUsers(req as Request, res as Response);

      sinon.assert.calledWith(res.status as sinon.SinonStub, 500);
    });

    it('should return 0 users when invalid sorting field provided', async () => {
      req.query.sort = 'invalidField';
      await getUsers(req as Request, res as Response);

      const users = (res.send as sinon.SinonStub).lastCall.args[0].users;
      expect(users.length).equal(0);
    });
  });

  describe('patch()', () => {

    let uid;

    before(async function () {

      this.timeout(7000);

      req = newReq();
      res = newRes();

      await create(req as Request, res as Response);
      uid = (res.send as sinon.SinonStub).lastCall.args[0].uid;
    });

    beforeEach(() => {
      req = newReq();
      res = newRes();
      req.params = {id: uid};
    });

    after(async function () {
      await admin.auth().deleteUser(uid);
      await db.doc(`users/${uid}`).delete();
    });

    it('should return 200 when email is missing', async () => {
      delete req.body.email;
      await patch(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 200);
    });

    it('should return 200 when displayName is missing', async () => {
      delete req.body.displayName;
      await patch(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 200);
    });

    it('should return 200 when role is missing', async () => {
      delete req.body.role;
      await patch(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 200);
    });

    it('should update user in firebase auth', async function () {
      await patch(req as Request, res as Response);

      sinon.assert.calledWith(res.status as sinon.SinonStub, 200);

      const response = (res.send as sinon.SinonStub).lastCall.args[0];

      const docRef = await db.doc(`users/${response.uid}`).get();
      expect(docRef.data()).to.include({
        displayName: req.body.displayName,
        email: req.body.email,
        role: req.body.role
      });
    });

    it('should update password', async function () {
      this.timeout(7000);
      password = 'longer' + password;
      req.body.password = password;

      await patch(req as Request, res as Response);
      const response = await signIn(req.body.email, password);
      expect(response).ownProperty('idToken');
    });

    it('should validate password', async function () {
      this.timeout(7000);
      req.body.password = 'short';

      await patch(req as Request, res as Response);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 400);

      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Password/);
    });

    it('should update role in custom claims', async function () {
      this.timeout(10000);
      req.body.role = Roles.admin;
      await patch(req as Request, res as Response);

      const {idToken} = await signIn(req.body.email, req.body.password);
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      expect(decodedToken).ownProperty('role').equals(req.body.role);
    });
  });

  describe('remove()', () => {

    beforeEach(() => {
      req = newReq();
      res = newRes();
    });

    it('should remove user from auth and firestore', async function () {
      this.timeout(7000);
      await create(req as Request, res as Response);
      const uid = (res.send as sinon.SinonStub).lastCall.args[0].uid;

      let docSnap = await db.doc(`users/${uid}`).get();
      expect(docSnap.exists).equal(true);

      let userExist = true;
      req.params.id = uid;
      await remove(req as Request, res as Response);

      try {
        await admin.auth().getUser(uid);
      } catch (e) {
        userExist = false;
      }
      expect(userExist).equal(false);

      docSnap = await db.doc(`users/${uid}`).get();
      expect(docSnap.exists).equal(false);
    });

    it.skip('should remove user comments from firestore', async function () {
      this.timeout(7000);
      await create(req as Request, res as Response);
      const uid = (res.send as sinon.SinonStub).lastCall.args[0].uid;

      await db.collection('ratings').add({
        uid,
        rating: 3
      });

      let docSnap = await db.collection('ratings').where('uid', '==', uid).get();
      expect(docSnap.size).equal(1);

      req.params.id = uid;
      await remove(req as Request, res as Response);

      // add ticks if trigger to clean up is late
      docSnap = await db.collection('ratings').where('uid', '==', uid).get();
      expect(docSnap.size).equal(0);
    });
  });
});

function isSortedByField(arr, field, direction: OrderByDirection = 'asc') {

  const checker = (() => {
    return direction === 'asc' ? (a, b) => (a > b) : (a, b) => (a < b);
  })();

  for (let i = 1; i < arr.length; i++) {
    if (checker(arr[i - 1][field], arr[i][field])) {
      return false;
    }
  }

  return true;
}

