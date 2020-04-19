import { Request, Response } from 'express';
import { DATA_CONFLICT, FORBIDDEN, handleError, validateRating, validateRequired } from '../utils';
import * as admin from 'firebase-admin';
import { Review } from '../interfaces/review';
import { Restaurant } from '../interfaces/restaurant';
import { User } from '../interfaces/user';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

const DEFAULT_LIMIT_PER_PAGE = 10;

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

    const checkSnaps = await admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                                  .where('userId', '==', uid)
                                  .get();

    if (checkSnaps.size) {
      throw {name: DATA_CONFLICT, message: 'You already added review'};
    }

    // todo: can be moved to cloud functions if execution time is long
    await admin.firestore().runTransaction(transaction => {
      return transaction.get(restaurantRef).then(doc => {
        const restaurant = doc.data() as Restaurant;

        if (restaurant.ownerId === uid) {
          throw {name: FORBIDDEN, message: 'You can not rate your own restaurant'};
        }

        const newAverage =
          (restaurant.numRatings * restaurant.avgRating + rating) /
          (restaurant.numRatings + 1);

        const pendingReplies = restaurant.pendingReplies ? restaurant.pendingReplies + 1 : 1;

        transaction.update(restaurantRef, {
          numRatings: restaurant.numRatings + 1,
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

export async function getReviews(req: Request, res: Response) {
  try {
    const limit = Number(req.body.limit) || DEFAULT_LIMIT_PER_PAGE;
    const lastReviewId = req.body.lastReviewId;
    const {restaurantId} = req.params;

    let initDocsRef;

    if (req.body.filterName) {
      initDocsRef = admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                         .where(req.body.filterName, '==', req.body.filterVal)
                         .orderBy('createdAt', 'desc');
    } else {
      initDocsRef = admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                         .orderBy('createdAt', 'desc');
    }

    if (lastReviewId) {
      const lastReviewSnap = await admin.firestore()
                                        .doc(`restaurants/${restaurantId}/reviews/${lastReviewId}`).get();

      initDocsRef = initDocsRef.startAfter(lastReviewSnap);
    }

    const docsSnap = await initDocsRef.limit(limit).get();
    const reviews = await Promise.all(docsSnap.docs.map(doc => mapReview(doc, restaurantId)));

    res.status(200);

    return res.send({
      reviews
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getMyReview(req: Request, res: Response) {
  try {
    const {restaurantId} = req.params;
    const {uid} = res.locals;

    let review = null;

    const reviewSnaps = await admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                                   .where('userId', '==', uid)
                                   .limit(1).get();

    if (reviewSnaps.docs.length) {
      review = await mapReview(reviewSnaps.docs[0], restaurantId);
    }

    res.status(200);

    return res.send(
      {review}
    );
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getHighestAndLowest(req: Request, res: Response) {
  try {
    const {restaurantId} = req.params;
    const reviews = [];

    const highestSnaps = await admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                                    .orderBy('rating', 'desc')
                                    .orderBy('createdAt', 'desc').limit(1).get();

    if (highestSnaps.docs.length) {
      reviews.push(await mapReview(highestSnaps.docs[0], restaurantId));
    }

    const lowestSnaps = await admin.firestore().collection(`restaurants/${restaurantId}/reviews`)
                                   .orderBy('rating', 'asc')
                                   .orderBy('createdAt', 'desc').limit(1).get();

    if (lowestSnaps.docs.length && !highestSnaps.docs[0].isEqual(lowestSnaps.docs[0])) {
      reviews.push(await mapReview(lowestSnaps.docs[0], restaurantId));
    }

    res.status(200);

    return res.send({
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

  if (review.reply && review.reply.userId) {
    const replyAuthorSnap = await admin.firestore().doc(`users/${review.reply.userId}`).get();
    const replyAuthor = replyAuthorSnap.data() as User;
    review.reply = {...review.reply, user: replyAuthor};
  }

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

