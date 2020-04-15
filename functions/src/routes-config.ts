import { Application } from 'express';
import { isAuthenticated } from './authenticated';
import { isAuthorized } from './authorized';
import { create, get, getUsers, patch, remove, resetPassword } from './controllers/users.controller';
import { UserManagerRoles } from './roles';
import { createReview, getReviews } from './controllers/review.controller';

export function routesConfig(app: Application) {
  userRoutes(app);
  reviewRoutes(app);
}

function reviewRoutes(app: Application) {

  app.post('/restaurants/:restaurantId/reviews', [
    isAuthenticated,
    createReview
  ]);

  app.get('/restaurants/:restaurantId/reviews', [
    getReviews
  ]);
}

function userRoutes(app: Application) {

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

