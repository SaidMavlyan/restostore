import { Request, Response } from 'express';
import { FORBIDDEN, handleError, validateRequired } from '../utils';
import * as admin from 'firebase-admin';
import { Reply, Review } from '../interfaces/review';
import { Restaurant } from '../interfaces/restaurant';
import { Roles } from '../roles';
import { User } from '../interfaces/user';

export async function setReply(req: Request, res: Response) {
  try {
    const {text} = req.body as Partial<Reply>;
    const {restaurantId, reviewId} = req.params;
    const {uid, role} = res.locals;

    let reply: Reply;
    validateRequired(text);

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc(reviewId);

    await admin.firestore().runTransaction(async transaction => {
      const resSnap = await transaction.get(restaurantRef);
      const revSnap = await transaction.get(reviewRef);

      const restaurant = resSnap.data() as Restaurant;
      const review = revSnap.data() as Review;

      if (role !== Roles.admin && restaurant.ownerId !== uid) {
        throw {name: FORBIDDEN, message: 'Unauthorized to reply'};
      }

      reply = {
        text,
        userId: uid,
        createdAt: new Date()
      };

      if (review.reply) {

        reply.createdAt = review.reply.createdAt;
        reply.modifiedAt = new Date();

      } else {

        transaction.update(restaurantRef, {
          pendingReplies: restaurant.pendingReplies - 1
        });

      }

      return transaction.update(reviewRef, {reply});
    });

    let updatedReply = ((await reviewRef.get()).data() as Review).reply;
    const replyAuthorSnap = await admin.firestore().doc(`users/${updatedReply.userId}`).get();
    const replyAuthor = replyAuthorSnap.data() as User;
    updatedReply = {...updatedReply, user: replyAuthor};

    res.status(201);
    return res.send(updatedReply);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteReply(req: Request, res: Response) {
  try {
    const {restaurantId, reviewId} = req.params;
    const {uid, role} = res.locals;

    const restaurantRef = admin.firestore().doc(`restaurants/${restaurantId}`);
    const reviewRef = restaurantRef.collection(`reviews`).doc(reviewId);

    await admin.firestore().runTransaction(async transaction => {
      const resSnap = await transaction.get(restaurantRef);
      const revSnap = await transaction.get(reviewRef);

      const restaurant = resSnap.data() as Restaurant;
      const review = revSnap.data() as Review;

      if (role !== Roles.admin && restaurant.ownerId !== uid) {
        throw {name: 'Auth', message: 'Unauthorized to reply'};
      }

      if (review.reply) {
        transaction.update(restaurantRef, {
          pendingReplies: restaurant.pendingReplies + 1
        });
      }

      return transaction.update(reviewRef, {reply: null});
    });

    res.status(204);
    return res.send({});
  } catch (err) {
    return handleError(res, err);
  }
}
