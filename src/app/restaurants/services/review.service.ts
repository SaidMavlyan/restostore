import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, finalize } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { Review } from '../models/review';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = `${environment.baseUrl}/api/restaurants`;

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  addReview(restaurantId, review: Review) {
    this.loaderService.show();
    return this.http.post<{ uid: string }>(`${this.baseUrl}/${restaurantId}/reviews`, review)
               .pipe(
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               ).toPromise();
  }

  getReviews(restaurantId: string, {limit, page}) {
    this.loaderService.show();
    let params = new HttpParams();

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<{ totalSize: number; reviews: Review[] }>(`${this.baseUrl}/${restaurantId}/reviews`, {params})
               .pipe(
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               );
  }
}
