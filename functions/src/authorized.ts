import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { RoleLevel, Roles } from './roles';

export function isAuthorized(opts: { hasRole: Array<string>, allowSameUser?: boolean }) {
  return (async (req: Request, res: Response, next: any) => {

    try {
      const {role, uid} = res.locals;
      const {id} = req.params;

      if (req.body?.role) {
        validateRoleFromTo(role, req.body.role);
      }

      if (id) {
        const user = await admin.firestore().doc(`users/${id}`).get();
        validateRoleFromTo(role, user.data()?.role);
      }

      if (opts.allowSameUser && id && uid === id) {
        return next();
      }

      if (role && opts.hasRole.includes(role)) {
        return next();
      }

      throw new Error('Fulfill all requirements');
    } catch (err) {
      res.status(403);
      return res.send({message: `Unauthorized: ${err.message}`});
    }
  });
}

function validateRoleFromTo(fromRole: string, toRole: string) {
  if (!(fromRole in Roles) || !(toRole in Roles) ||
    (RoleLevel[fromRole] < RoleLevel[toRole])) {
    throw new Error('Unauthorized: role validation throws error');
  }
}
