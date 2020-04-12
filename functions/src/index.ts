import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Roles } from './roles';
import { routesConfig } from './routes-config';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());
app.use(cors({origin: true}));
routesConfig(app);

export const api = functions.https.onRequest(app);

export const createdUser = functions
  .firestore.document('users/{userId}')
  .onCreate(async (snap) => {
    const {role, uid, email} = snap.data();

    // // needed to create first admin, can be commented out after creation of first admin
    // if (email === 'admin@domain.com') {
    //   await admin.auth().setCustomUserClaims(uid, {role: Roles.admin});
    //   await db.doc(`users/${uid}`).set({
    //     role: Roles.admin,
    //   }, {merge: true});
    //
    //   console.log('Admin user is created');
    //   return;
    // }

    // todo: may need to setTimeout 1s, because of the limitations of the Firestore
    if (!role) {
      await admin.auth().setCustomUserClaims(uid, {role: Roles.user});
      await db.doc(`users/${uid}`).set({
        role: Roles.user,
      }, {merge: true});

      console.log('Role is set for newly created user');
    }
  });

export const userDeleted = functions.auth.user().onDelete(async (user: admin.auth.UserRecord) => {
  try {
    console.log('Deleting data related to user: ', user);
    const restoSnaps = await db.collection(`restaurants`)
                               .where('uid', '==', user.uid)
                               .get();

    await Promise.all(restoSnaps.docs.map(doc => db.doc(`restaurants/${doc.id}`).delete()));
  } catch (err) {
    console.error('Error while deleting user data:', err);
  }
});
