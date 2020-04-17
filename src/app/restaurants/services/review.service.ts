import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, finalize, map } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { Reply, Review } from '../models/review';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface ReviewQuery {
  limit: number;
  page: number;
  filterName?: string;
  filterVal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = `${environment.baseUrl}/api/restaurants`;
  reviews$ = new BehaviorSubject<Review[]>(null);

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  addReview(restaurantId, review: Review) {
    this.loaderService.show();
    return this.http.post<Review>(`${this.baseUrl}/${restaurantId}/reviews`, review)
               .pipe(
                 map(result => {
                   this.reviews$.next([result, ...this.reviews$.value]);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  getReviews(restaurantId: string, query: ReviewQuery) {
    this.loaderService.show();
    this.reviews$.next([]);

    return this.http.post<{ totalSize: number; reviews: Review[] }>(`${this.baseUrl}/${restaurantId}/reviews/fetch`, query)
               .pipe(
                 map(result => {
                   this.reviews$.next(result.reviews);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               );
  }

  updateReview(review: Partial<Review>) {
    this.loaderService.show();
    return this.http.patch<Review>(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}`, review)
               .pipe(
                 map(result => {
                   const reviews = this.reviews$.value;
                   reviews.splice(reviews.findIndex(r => r.id === review.id), 1, result);
                   this.reviews$.next(reviews);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  deleteReview(review: Review) {
    this.loaderService.show();
    return this.http.delete(`${this.baseUrl}/${review.restaurantId}/reviews/${review.id}`).pipe(
      map(result => {
        this.reviews$.next(this.reviews$.value.filter(r => r.id !== review.id));
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
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }
}
