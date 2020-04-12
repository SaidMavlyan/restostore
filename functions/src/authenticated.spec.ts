import 'mocha';
import {Request, Response} from 'express';
import * as sinon from 'sinon';
import {expect} from 'chai';
import {isAuthenticated} from './authenticated';
import {idToken} from './test-data.spec';

describe('authenticated.ts', function () {

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next;

  beforeEach(() => {
    req = {headers: {}};
    res = {
      status: sinon.stub(),
      send: sinon.stub()
    };
  });

  describe('when called with empty header', () => {

    it('should return status: 401', async () => {
      await isAuthenticated(req as Request, res as Response, null);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 401);
    });

    it('should return {message: "Unauthorized:..."}', async () => {
      await isAuthenticated(req as Request, res as Response, null);

      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Unauthorized:/);
    });

  });

  describe('when called with invalid token', () => {

    beforeEach(() => {
      req = {headers: {authorization: `Bearer ${Math.random()}`}};
    });

    it('should return {message: "Unauthorized:..."}', async () => {
      await isAuthenticated(req as Request, res as Response, null);
      const responseMessage = (res.send as sinon.SinonStub).lastCall.args[0];
      expect(responseMessage).to.have.property('message').match(/^Unauthorized:/);
    });

    it('should return status: 401', async () => {
      await isAuthenticated(req as Request, res as Response, null);
      sinon.assert.calledWith(res.status as sinon.SinonStub, 401);
    });

  });

  describe('when called with valid token', () => {

    beforeEach(() => {
      req = {
        headers: {authorization: `Bearer ${idToken}`}
      };
      next = sinon.stub();
    });

    it('should call next()', async () => {
      await isAuthenticated(req as Request, res as Response, next);
      sinon.assert.calledOnce(next as sinon.SinonStub);
    });

    it('should add `locals: {uid, role, email...}` to res', async () => {
      await isAuthenticated(req as Request, res as Response, next);
      expect(res).to.ownProperty('locals').includes.keys('uid', 'role', 'email');
    });
  });
});

