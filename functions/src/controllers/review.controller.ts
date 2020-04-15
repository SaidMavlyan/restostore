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
  ratings: Review[];
}

interface Review {
  userId: string;
  comment: string;
  rating: number;
  restaurantId?: string;
}

export async function createReview(req: Request, res: Response) {
  try {
    const {restaurantId, rating, comment} = req.body as Partial<Review>;
    const {uid} = res.locals;

    validateRequired(restaurantId, rating, comment);
    validateRating(rating);

    const restaurantDoc = admin.firestore().doc(`restaurants/${restaurantId}`);
    const ratingDoc = restaurantDoc.collection(`ratings`).doc();

    // todo: can be moved to cloud functions if execution time is long
    await admin.firestore().runTransaction(transaction => {
      return transaction.get(restaurantDoc).then(doc => {
        const data = doc.data() as Restaurant;

        const newAverage =
          (data.numRatings * data.avgRating + rating) /
          (data.numRatings + 1);

        transaction.update(restaurantDoc, {
          numRatings: data.numRatings + 1,
          avgRating: newAverage
        });

        return transaction.set(ratingDoc, {userId: uid, rating, comment});
      });
    });

    res.status(201);
    return res.send({...req.body, uid});
  } catch (err) {
    return handleError(res, err);
  }
}
