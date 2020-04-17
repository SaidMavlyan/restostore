import { Request, Response } from 'express';
import { handleError, validateRating, validateRequired } from '../utils';
import * as admin from 'firebase-admin';
import { Review } from '../interfaces/review';
import { Restaurant } from '../interfaces/restaurant';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

export async function createReview(req: Request, res: Response) {
  try {
    const {rating, comment, dateOfVisit} = req.body as Partial<Review>;
    const {restaurantId} = req.params;
    const {uid} = res.locals;
    let entry: Review;

    validateRequired(restaurantId, rating, comment, dateOfVisit);
    validateRating(rating);

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc();

    // todo: can be moved to cloud functions if execution time is long
    await admin.firestore().runTransaction(transaction => {
      return transaction.get(restaurantRef).then(doc => {
        const data = doc.data() as Restaurant;

        const newAverage =
          (data.numRatings * data.avgRating + rating) /
          (data.numRatings + 1);

        const pendingReplies = data.pendingReplies ? data.pendingReplies + 1 : 1;

        transaction.update(restaurantRef, {
          numRatings: data.numRatings + 1,
          pendingReplies,
          avgRating: newAverage
        });

        entry = {
          userId: uid,
          rating,
          comment,
          dateOfVisit,
          reply: null,
          createdAt: new Date()
        };

        return transaction.set(reviewRef, entry);
      });
    });

    const updatedSnap = await reviewRef.get();

    res.status(201);
    return res.send(await mapReview(updatedSnap, restaurantId));
  } catch (err) {
    return handleError(res, err);
  }
}

const DEFAULT_LIMIT_PER_PAGE = 10;

export async function getReviews(req: Request, res: Response) {
  try {
    const reqLimit = Number(req.query.limit);
    const pageSize = (reqLimit > 0 && reqLimit < 1000) ? reqLimit : DEFAULT_LIMIT_PER_PAGE;
    const page = Number(req.query.page) || 0;
    const {restaurantId} = req.params;

    const initDocsRef = admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                             .orderBy('createdAt', 'desc');

    const totalDocsRef = await initDocsRef.get();
    const totalSize = totalDocsRef.size;

    const docsSnap = await initDocsRef.offset(pageSize * page).limit(pageSize).get();
    const reviews = await Promise.all(docsSnap.docs.map(doc => mapReview(doc, restaurantId)));

    res.status(200);

    return res.send({
      totalSize,
      reviews
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function patchReview(req: Request, res: Response) {
  try {
    const {rating, comment, dateOfVisit} = req.body as Partial<Review>;
    const {restaurantId, reviewId} = req.params;

    validateRequired(reviewId, restaurantId, rating, comment, dateOfVisit);
    validateRating(rating);

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc(reviewId);

    await admin.firestore().runTransaction(async transaction => {
      const resSnap = await transaction.get(restaurantRef);
      const revSnap = await transaction.get(reviewRef);

      const restaurant = resSnap.data() as Restaurant;
      const review = revSnap.data() as Review;

      const newAverage =
        (restaurant.numRatings * restaurant.avgRating - review.rating + rating) /
        (restaurant.numRatings);

      transaction.update(restaurantRef, {
        avgRating: newAverage
      });

      return transaction.update(reviewRef, {rating, comment, dateOfVisit});
    });

    const updatedSnap = await reviewRef.get();

    res.status(200);
    return res.send(await mapReview(updatedSnap, restaurantId));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const {restaurantId, reviewId} = req.params;

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc(reviewId);

    await admin.firestore().runTransaction(async transaction => {
      const resSnap = await transaction.get(restaurantRef);
      const revSnap = await transaction.get(reviewRef);

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
    res.status(204);
    return res.send({});
  } catch (err) {
    return handleError(res, err);
  }
}

async function mapReview(doc: DocumentSnapshot, restaurantId: string) {
  const review = doc.data() as Review;
  const userSnap = await admin.firestore().doc(`users/${review.userId}`).get();
  const user = userSnap.data();

  return {
    restaurantId,
    id: doc.id,
    user: {
      uid: user.uid,
      displayName: user?.displayName,
      photoURL: user?.photoURL
    },
    ...review
  };
}

