import { Request, Response } from 'express';
import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import { handleError, signIn, validatePassword, validateRequired } from '../utils';
import OrderByDirection = firebase.firestore.OrderByDirection;

const DEFAULT_LIMIT_PER_PAGE = 10;

export interface User {
  uid: string;
  displayName: string;
  role: string;
  email: string;
}

export async function create(req: Request, res: Response) {
  try {
    const {displayName, password, email, role} = req.body;

    validateRequired(displayName, password, email, role);
    validatePassword(password);

    const {uid} = await admin.auth().createUser({
      displayName,
      password,
      email
    });

    await admin.auth().setCustomUserClaims(uid, {role});

    await admin.firestore().doc(`users/${uid}`).set({
      uid,
      displayName,
      email,
      role
    });

    res.status(201);
    return res.send({uid});
  } catch (err) {
    return handleError(res, err);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const {password, newPassword} = req.body;
    const {id} = req.params;

    validateRequired(id, password, newPassword);
    validatePassword(newPassword);

    const user = await admin.auth().getUser(id);
    await signIn(user.email, password);

    await admin.auth().updateUser(id, {password: newPassword});

    res.status(200);
    return res.send({password, uid: id});
  } catch (err) {
    return handleError(res, err);
  }
}

export async function get(req: Request, res: Response) {
  try {
    const {id} = req.params;
    const user = await admin.auth().getUser(id);
    const userInfo = await mapUser(user);
    res.status(200);
    return res.send({user: userInfo});
  } catch (err) {
    return handleError(res, err);
  }
}

export async function patch(req: Request, res: Response) {
  try {
    const {id} = req.params;
    const {displayName, password, email, role} = req.body;

    validateRequired(id);

    const updateData: Partial<User> = {};

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (password) {
      validatePassword(password);
      await admin.auth().updateUser(id, {...updateData, password});
    } else if (email || displayName) {
      await admin.auth().updateUser(id, updateData);
    }

    if (role !== undefined) {
      await admin.auth().setCustomUserClaims(id, {role});
      updateData.role = role;
    }

    await admin.firestore().doc(`users/${id}`).set(updateData, {merge: true});

    res.status(200);
    return res.send({uid: id});
  } catch (err) {
    return handleError(res, err);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const {id} = req.params;
    await admin.auth().deleteUser(id);
    await admin.firestore().doc(`users/${id}`).delete();
    res.status(204);
    return res.send({});
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const reqLimit = Number(req.query.limit);
    const pageSize = (reqLimit > 0 && reqLimit < 1000) ? reqLimit : DEFAULT_LIMIT_PER_PAGE;
    const page = Number(req.query.page) || 0;
    const sorting = (req.query?.sort?.split(':'));

    let initDocsRef: any = admin.firestore().collection('users');

    if (sorting) {
      initDocsRef = initDocsRef.orderBy(sorting[0], sorting[1] as OrderByDirection);
    }

    // todo: refactor to not query all users
    const totalDocsRef = await initDocsRef.get();
    const totalSize = totalDocsRef.size;

    const docsSnap = await initDocsRef.offset(pageSize * page).limit(pageSize).get();
    const users = await docsSnap.docs.map(doc => doc.data());

    res.status(200);

    return res.send({
      totalSize,
      users
    });
  } catch (err) {
    return handleError(res, err);
  }
}

async function mapUser(user: admin.auth.UserRecord) {

  const customClaims = (user.customClaims) as { role: string };

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: customClaims?.role
  };
}

