import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, finalize, map } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { Review } from '../models/review';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

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
                   this.reviews$.next(this.reviews$.value.concat(result));
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  getReviews(restaurantId: string, {limit, page}) {
    this.loaderService.show();
    let params = new HttpParams();
    this.reviews$.next([]);

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<{ totalSize: number; reviews: Review[] }>(`${this.baseUrl}/${restaurantId}/reviews`, {params})
               .pipe(
                 map(result => {
                   this.reviews$.next(result.reviews);
                   return result;
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               );
  }

  delete(review: Review) {
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
}
