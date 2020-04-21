import 'mocha';
import * as request from 'supertest';
import { myFunctions } from './index.spec';

describe('routes-config.ts', () => {

  describe('POST `api/users`', () => {
    it('should return 401 when no token provided', async () => {
      request(myFunctions.api).post('/users')
        .expect('message', /^Unauthorized:/)
        .expect(401);
    });
  });
});
