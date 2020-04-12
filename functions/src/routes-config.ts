import { Application } from 'express';
import { isAuthenticated } from './authenticated';
import { isAuthorized } from './authorized';
import { create, get, getUsers, patch, remove, resetPassword } from './controller';
import { UserManagerRoles } from './roles';

export function routesConfig(app: Application) {

  app.post('/users', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles}),
    create
  ]);

  app.post('/users/:id/reset-password', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles, allowSameUser: true}),
    resetPassword
  ]);

  app.get('/users', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles}),
    getUsers
  ]);

  app.get('/users/:id', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles, allowSameUser: true}),
    get
  ]);

  app.patch('/users/:id', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles, allowSameUser: true}),
    patch
  ]);

  app.delete('/users/:id', [
    isAuthenticated,
    isAuthorized({hasRole: UserManagerRoles, allowSameUser: true}),
    remove
  ]);
}
