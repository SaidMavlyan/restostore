import 'mocha';
import * as request from 'supertest';
import { myFunctions } from './index.spec';

describe('routes-config.ts', () => {

  describe.skip('GET `api/test`', () => {
    it('should return `hello world`', () => {
      request(myFunctions.api).post('/helloWorld')
        .expect('hello world')
        .expect(200)
        .end((err) => {
          if (err) {
            throw err;
          }
        });
    });
  });

  describe('POST `api/users`', () => {
    it('should return 401 when no token provided', async () => {
      request(myFunctions.api).post('/users')
        .expect('message', /^Unauthorized:/)
        .expect(401);
    });
  });
});
