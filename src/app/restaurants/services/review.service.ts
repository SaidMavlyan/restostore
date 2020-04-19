import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, finalize, map } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { Reply, Review } from '../models/review';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ReviewsQueryParams } from '../models/reviews-query-params';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  reviews$ = new BehaviorSubject<Review[]>(null);
  myReview$ = new BehaviorSubject<Review>(null);

  private baseUrl = `${environment.baseUrl}/api/restaurants`;
  private readonly defaultLimit: number;

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
    this.defaultLimit = Math.ceil(window.innerHeight / 150);
  }

  addReview(restaurantId, review: Review) {
    this.loaderService.show();
    return this.http.post<Review>(`${this.baseUrl}/${restaurantId}/reviews`, review)
               .pipe(
                 map(result => {
                   this.myReview$.next(result);
                   this.reviews$.next([result, ...this.reviews$.value]);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  getHighestLowest(restaurantId) {
    this.http.get<{ reviews: Review[] }>(`${this.baseUrl}/${restaurantId}/reviews/highest-lowest`)
        .pipe(
          map(({reviews}) => {
            this.reviews$.next(union(reviews, this.reviews$.value));
          }),
          catchError(this.errorHandler.onHttpError)
        ).subscribe();
  }

  async getReviews(restaurantId: string, query: ReviewsQueryParams) {

    this.loaderService.show();
    const body = {limit: this.defaultLimit, lastReviewId: null, ...query};

    if (!query.isReset && this.reviews$.value.length) {
      body.lastReviewId = this.reviews$.value[this.reviews$.value.length - 1].id;
    } else {
      this.reviews$.next([]);
      if (!body.filterName) {
        this.getHighestLowest(restaurantId);
      }
    }

    return this.http.post<{ reviews: Review[] }>(`${this.baseUrl}/${restaurantId}/reviews/fetch`, body)
               .pipe(
                 map(({reviews}) => {
                   this.reviews$.next(union(this.reviews$.value, reviews));
                   return reviews;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  handleOnUpdate(review: Review) {
    const reviews = this.reviews$.value;
    const indexInReviews = reviews.findIndex(r => r.id === review.id);

    if (indexInReviews > -1) {
      reviews.splice(indexInReviews, 1, review);
      this.reviews$.next(reviews);
    }

    if (this.myReview$.value?.userId === review.userId) {
      this.myReview$.next(review);
    }
  }

  updateReview(review: Partial<Review>) {
    this.loaderService.show();
    return this.http.patch<Review>(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}`, review)
               .pipe(
                 map(result => {
                   this.handleOnUpdate(result);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  handleOnDelete(review: Review) {
    const reviews = this.reviews$.value;
    this.reviews$.next(reviews.filter(r => r.id !== review.id));

    if (this.myReview$.value?.userId === review.userId) {
      this.myReview$.next(null);
    }
  }

  deleteReview(review: Review) {
    this.loaderService.show();
    return this.http.delete(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}`).pipe(
      map(result => {
        this.handleOnDelete(review);
        return result;
      }),
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    );
  }

  async setReply(review: Review, reply: Reply) {
    this.loaderService.show();
    return this.http.post<Reply>(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}/replies`, reply)
               .pipe(
                 map(result => {
                   review.reply = result;
                   this.handleOnUpdate(review);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  async deleteReply(review: Review) {
    this.loaderService.show();
    return this.http.delete(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}/replies`)
               .pipe(
                 map(result => {
                   review.reply = null;
                   this.handleOnUpdate(review);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  async getMyReview(restaurantId): Promise<Review> {
    return this.http.get<{ review: Review }>(`${this.baseUrl}/${restaurantId}/reviews/mine`)
               .pipe(
                 map(({review}) => {
                   this.myReview$.next(review);
                   return review;
                 }),
                 catchError(this.errorHandler.onHttpError)
               ).toPromise();
  }
}

function union(a: Array<Review>, b: Array<Review>) {
  b = b.filter(rB => a.findIndex(rA => rA.id === rB.id) < 0);
  return a.concat(b);
}

