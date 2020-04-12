import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { Roles } from './roles';

export async function isAuthenticated(req: Request, res: Response, next: any) {
  let token: string;

  try {
    const {authorization} = req.headers;
    token = authorization.split('Bearer ')[1];
  } catch (err) {
    res.status(401);
    return res.send({message: `Unauthorized: ${err.message}`});
  }

  try {
    const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
    res.locals = {
      ...res.locals,
      uid: decodedToken.uid,
      role: decodedToken.role || Roles.user,
      email: decodedToken.email
    };
    return next();
  } catch (err) {
    res.status(401);
    return res.send({message: `Unauthorized: ${err.message}`});
  }
}
