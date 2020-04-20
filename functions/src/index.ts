import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Roles } from './roles';
import { routesConfig } from './routes-config';
import { Restaurant } from './interfaces/restaurant';
import { Review } from './interfaces/review';
import QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;

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
    const {role, uid} = snap.data();

    // const {role, uid, email} = snap.data();
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
    console.log('Deleting restaurants >');
    const restoSnaps = await db.collection(`restaurants`)
                               .where('uid', '==', user.uid)
                               .get();

    await Promise.all(restoSnaps.docs.map(doc => db.doc(`restaurants/${doc.id}`).delete()));

    console.log('Deleting reviews >');
    await deleteUserReviews(user.uid);

  } catch (err) {
    console.error('Error while deleting user data:', err);
  }
});

async function deleteUserReviews(userId: string) {
  const reviewSnaps = await db.collectionGroup(`reviews`)
                              .where('userId', '==', userId)
                              .get();

  reviewSnaps.forEach(revSnap => {
    deleteReview(revSnap);
  });
}

function deleteReview(revSnap: QueryDocumentSnapshot) {
  admin.firestore().runTransaction(async transaction => {
    const reviewRef = revSnap.ref;
    const restaurantRef = reviewRef.parent.parent;
    const resSnap = await transaction.get(restaurantRef);

    const restaurant = resSnap.data() as Restaurant;
    const review = revSnap.data() as Review;

    let newAverage: number;

    if (restaurant.numRatings === 1) {
      newAverage = 0;
    } else {
      newAverage =
        (restaurant.numRatings * restaurant.avgRating - review.rating) /
        (restaurant.numRatings - 1);
    }

    transaction.update(restaurantRef, {
      numRatings: restaurant.numRatings - 1,
      pendingReplies: review.reply === null ? restaurant.pendingReplies - 1 : restaurant.pendingReplies,
      avgRating: newAverage
    });

    return transaction.delete(reviewRef);
  });
}
