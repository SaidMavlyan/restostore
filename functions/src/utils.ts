import axios from 'axios';
import * as admin from 'firebase-admin';
import { environment } from '../../src/environments/environment';
import { Response } from 'express';

const apiKey = environment.firebase.apiKey;

interface RestUser {
  localId: string;
  idToken: string;
  email: string;
}

export async function signUp(email: string, password: string): Promise<RestUser> {
  const singUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const response = await axios.post(singUpUrl, {
    email,
    password,
    returnSecureToken: true
  });

  return response.data;
}

export async function signIn(email: string, password: string): Promise<RestUser> {
  const singInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const response = await axios.post(singInUrl, {
    email,
    password,
    returnSecureToken: true
  });

  return response.data;
}

export async function createTestUser(role: string = 'user'): Promise<RestUser> {
  const email = 'user23@example.com';
  const password = 'test1234';

  await admin.auth().getUserByEmail(email).then(user => {
    return admin.auth().deleteUser(user.uid);
  }).catch(() => 'ignore if user is not found');

  try {
    const userId = (await signUp(email, password)).localId;

    await admin.auth().setCustomUserClaims(userId, {role});
    // after setting custom claims token is changed so login is required to get the new token
    return await signIn(email, password);

  } catch (e) {
    console.log('Failed to create user', e.response.data);
  }
}

export const DATA_VALIDATION_ERROR = 'DataValidationError';
export const DATA_CONFLICT = 'DataConflict';

export function handleError(res: Response, err: any) {
  if (err.name === DATA_CONFLICT) {
    res.status(409);
    return res.send({message: `${err.message}`});
  } else if (err.name === DATA_VALIDATION_ERROR) {
    res.status(400);
    return res.send({message: `${err.message}`});
  } else {
    res.status(500);
    return res.send({message: `${err.message}`});
  }
}

export function validateRating(rating: number) {
  if (rating < 1 || rating > 5) {
    throw {name: DATA_VALIDATION_ERROR, message: 'Rating should be between 1 and 5'};
  }
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    throw {name: DATA_VALIDATION_ERROR, message: 'Password should be more than 8 characters long'};
  }
}

export function validateRequired(...fields) {
  if (fields.some(field => !field)) {
    throw {name: DATA_VALIDATION_ERROR, message: 'Missing fields'};
  }
}

