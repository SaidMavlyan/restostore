import { Application } from 'express';
import { isAuthenticated } from './authenticated';
import { isAuthorized } from './authorized';
import { create, get, getUsers, patch, remove, resetPassword } from './controllers/users.controller';
import { Roles, UserManagerRoles } from './roles';
import { createReview, deleteReview, getReviews, patchReview } from './controllers/review.controller';
import { setReply } from './controllers/replies.controller';

export function routesConfig(app: Application) {
  userRoutes(app);
  reviewRoutes(app);
  replyRoutes(app);
}

function replyRoutes(app: Application) {
  app.post('/restaurants/:restaurantId/reviews/:reviewId/replies', [
    isAuthenticated,
    isAuthorized({hasRole: [Roles.admin, Roles.owner]}),
    setReply
  ]);
}

function reviewRoutes(app: Application) {

  app.post('/restaurants/:restaurantId/reviews', [
    isAuthenticated,
    createReview
  ]);

  app.get('/restaurants/:restaurantId/reviews', [
    getReviews
  ]);

  app.patch('/restaurants/:restaurantId/reviews/:reviewId', [
    isAuthenticated,
    isAuthorized({hasRole: [Roles.admin], allowSameUser: true}),
    patchReview
  ]);

  app.delete('/restaurants/:restaurantId/reviews/:reviewId', [
    isAuthenticated,
    isAuthorized({hasRole: [Roles.admin], allowSameUser: true}),
    deleteReview
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

