import { Request, Response } from 'express';
import { handleError, validateRequired } from '../utils';
import * as admin from 'firebase-admin';
import { Reply, Review } from '../interfaces/review';
import { Restaurant } from '../interfaces/restaurant';

export async function createReply(req: Request, res: Response) {
  try {
    const {text} = req.body as Partial<Reply>;
    const {restaurantId, reviewId} = req.params;
    const {uid} = res.locals;

    let reply: Reply;
    // todo: validate owner of the restaurant
    validateRequired(text);

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc(reviewId);
    const reviewSnap = await reviewRef.get();
    const review = reviewSnap.data() as Review;

    if (review.reply) {
      throw new Error('Review already has reply');
    }

    await admin.firestore().runTransaction(async transaction => {
      const resSnap = await transaction.get(restaurantRef);
      const restaurant = resSnap.data() as Restaurant;

      transaction.update(restaurantRef, {
        pendingReplies: restaurant.pendingReplies - 1
      });

      reply = {
        text,
        authorId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      return transaction.update(reviewRef, {reply});
    });

    res.status(201);
    return res.send(reply);
  } catch (err) {
    return handleError(res, err);
  }
}
