import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { convertSnaps } from '../../services/utils';
import { Review } from '../models/review';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = `${environment.baseUrl}/api/reviews`;

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  addReview(restaurantId, review: Review) {
    this.loaderService.show();
    return this.http.post<{ uid: string }>(`${this.baseUrl}`, {restaurantId, ...review}).pipe(
      map(result => {
        console.log('result');
        return result;
      }),
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    ).toPromise();
  }

  getRatings(id: string): Observable<Review[]> {
    this.loaderService.show();
    return this.db.collection(`restaurants/${id}/ratings`)
               .snapshotChanges()
               .pipe(
                 map(snaps => {
                   this.loaderService.hide();
                   return convertSnaps<Review>(snaps);
                 }),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => {
                   this.loaderService.hide();
                 })
               );
  }
}
