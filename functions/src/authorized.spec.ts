import { expect } from 'chai';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import 'mocha';
import * as sinon from 'sinon';
import { isAuthorized } from './authorized';
import { Roles, UserManagerRoles } from './roles';

describe('authorized.ts', () => {

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next;

  beforeEach(() => {
    req = {headers: {}, params: {}};
    res = {
      status: sinon.stub(),
      send: sinon.stub(),
      locals: {
        uid: Math.random().toString(),
        email: 'test@domain.com',
        role: Roles.user
      }
    };
    next = sinon.stub();
  });

  describe('when called with invalid request', () => {
    it('should return status: 403', () => {
      req = {headers: {}};
      isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return {message: "Unauthorized:..."}', () => {
      req = {headers: {}};
      isAuthorized({hasRole: ['user']})(req as Request, res as Response, next);

      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Unauthorized:/);
    });
  });

  describe('when called with res without locals field (locals filled in isAuthenticated)', () => {
    beforeEach(() => {
      res = {
        status: sinon.stub(),
        send: sinon.stub(),
      };
    });

    it('should return status: 403', () => {
      isAuthorized({hasRole: ['user']})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return {message: "Unauthorized:..."}', () => {
      isAuthorized({hasRole: ['user']})(req as Request, res as Response, next);

      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Unauthorized:/);
    });
  });

  describe('when called with valid req, res', () => {
    const testUid = 'testUid';

    before(async function () {
      await admin.firestore().doc(`users/${testUid}`).set({
        uid: testUid,
        role: Roles.user
      });
    });

    after(async () => {
      await admin.firestore().doc(`users/${testUid}`).delete();
    });

    it('should call next if allowSameUser is set and ids match', async () => {
      req.params.id = testUid;
      res.locals.uid = testUid;

      await isAuthorized({hasRole: [], allowSameUser: true})(req as Request, res as Response, next);
      sinon.assert.calledOnce(next as sinon.SinonStub);
    });

    it('should return 403 if allowSameUser is set and ids do not match', async () => {
      req.params.id = testUid;
      res.locals.uid = testUid + 'a';
      await isAuthorized({hasRole: [], allowSameUser: true})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return 403 if role is not provided', async () => {
      req.params.id = testUid;
      res.locals.uid = testUid;
      res.locals.role = null;
      await isAuthorized({hasRole: []})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should call next if role is provided and in hasRole', async () => {
      req.params.id = testUid;
      res.locals.uid = 'randomUid';
      res.locals.role = UserManagerRoles[0];
      await isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledOnce(next as sinon.SinonStub);
    });

    it('should return 403 if role is provided and is not in hasRole', async () => {
      req.params.id = testUid;
      res.locals.uid = testUid;
      res.locals.role = Roles.user;
      await isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return 403 when allowUser: true, role: admin, roleTo: invalidRole', () => {
      req.params.id = testUid;
      res.locals.uid = testUid;
      res.locals.role = Roles.admin;
      req.body = {role: 'invalid' + Roles.admin};

      isAuthorized({hasRole: UserManagerRoles, allowSameUser: true})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return 403 when role: invalidRole, roleTo: admin', () => {
      res.locals.role = 'invalid' + Roles.admin;
      req.body = {role: Roles.admin};

      isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should call next when allowUser: true, role: admin, roleTo: admin', async () => {
      res.locals.uid = 'testId';
      res.locals.role = Roles.admin;
      req.params.id = testUid;
      req.body = {role: Roles.admin};

      await isAuthorized({hasRole: UserManagerRoles, allowSameUser: true})(req as Request, res as Response, next);
      sinon.assert.calledOnce(next as sinon.SinonStub);
    });

    it('should call next when role: admin, roleTo: manager', async () => {
      res.locals.uid = 'randomId';
      res.locals.role = Roles.admin;
      req.params.id = testUid;
      req.body = {role: Roles.manager};

      await isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledOnce(next as sinon.SinonStub);
    });

    it('should return 403 when allowUser: true, role: manager, roleTo: admin', () => {
      res.locals.uid = 'randomId';
      res.locals.role = Roles.manager;
      req.params.id = testUid;
      req.body = {role: Roles.admin};

      isAuthorized({hasRole: UserManagerRoles, allowSameUser: true})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });

    it('should return 403 when role: user, roleTo: admin', () => {
      res.locals.uid = 'randomId';
      res.locals.role = Roles.user;
      req.params.id = testUid;
      req.body = {role: Roles.admin};

      isAuthorized({hasRole: UserManagerRoles})(req as Request, res as Response, next);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 403);
    });
  });

});

