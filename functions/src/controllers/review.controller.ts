import { Request, Response } from 'express';
import { handleError, validateRating, validateRequired } from '../utils';
import * as admin from 'firebase-admin';

interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  photo: string;
  avgRating: number;
  numRatings: number;
  pendingReplies: number;
  ratings: Review[];
}

interface Review {
  userId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: any;
  reply: object;
  restaurantId?: string;
}

export async function createReview(req: Request, res: Response) {
  try {
    const {rating, comment, dateOfVisit} = req.body as Partial<Review>;
    const {restaurantId} = req.params;
    const {uid} = res.locals;
    let entry: Review;

    validateRequired(restaurantId, rating, comment, dateOfVisit);
    validateRating(rating);

    const restaurantDoc = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewDoc = restaurantDoc.collection(`reviews`).doc();

    // todo: can be moved to cloud functions if execution time is long
    await admin.firestore().runTransaction(transaction => {
      return transaction.get(restaurantDoc).then(doc => {
        const data = doc.data() as Restaurant;

        const newAverage =
          (data.numRatings * data.avgRating + rating) /
          (data.numRatings + 1);

        const pendingReplies = data.pendingReplies ? data.pendingReplies + 1 : 1;

        transaction.update(restaurantDoc, {
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
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        return transaction.set(reviewDoc, entry);
      });
    });

    res.status(201);
    return res.send({id: reviewDoc.id, restaurantId, ...entry});
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
                             .orderBy('createdAt');

    const totalDocsRef = await initDocsRef.get();
    const totalSize = totalDocsRef.size;

    const docsSnap = await initDocsRef.offset(pageSize * page).limit(pageSize).get();
    const reviews = await docsSnap.docs.map(doc => ({restaurantId, id: doc.id, ...doc.data()}));

    res.status(200);

    return res.send({
      totalSize,
      reviews
    });
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

      const newAverage =
        (restaurant.numRatings * restaurant.avgRating - review.rating) /
        (restaurant.numRatings - 1);

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

