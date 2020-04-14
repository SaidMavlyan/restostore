import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { convertDocs, convertSnap, convertSnaps } from '../../services/utils';
import { Restaurant } from '../models/restaurant';
import { Review } from '../models/review';
import { RestaurantsQueryParams } from '../models/restaurants-query-params';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  lastDoc: QueryDocumentSnapshot<DocumentData>;
  lastQuery: RestaurantsQueryParams = {};

  constructor(private db: AngularFirestore,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  loadRestaurants({isNext = false, limit = 10, sort = 'desc', rating}: RestaurantsQueryParams): Observable<Restaurant[]> {
    this.loaderService.show();
    this.lastQuery = arguments[0];
    if (!isNext) {
      this.lastDoc = null;
    }

    return this.db.collection('restaurants',
      ref => {
        let res = ref.orderBy('avgRating', sort as OrderByDirection);

        if (rating >= 0 && rating <= 5) {
          res = res.where('avgRating', '>=', rating)
                   .where('avgRating', '<', rating + 1);
        }

        if (this.lastDoc) {
          res = res.startAfter(this.lastDoc);
        }

        return res.limit(limit);
      })
               .get()
               .pipe(
                 take(1),
                 map(querySnapp => {
                   if (querySnapp.size) {
                     this.lastDoc = querySnapp.docs[querySnapp.size - 1];
                   }
                   return convertDocs<Restaurant>(querySnapp.docs);
                 }),
                 finalize(() => {
                   this.loaderService.hide();
                 })
               );
  }

  create(restaurant: Restaurant): Promise<void | Observable<never>> {
    this.loaderService.show();
    return this.db.collection('restaurants').add(restaurant)
               .then(() => {
               })
               .catch(this.errorHandler.onHttpError)
               .finally(() => {
                 this.loaderService.hide();
               });
  }

  get(id: string): Observable<Restaurant> {
    return this.db.doc(`restaurants/${id}`).snapshotChanges().pipe(
      map(snap => convertSnap<Restaurant>(snap)),
      catchError(this.errorHandler.onHttpError),
    );
  }

  update(id: string, restaurant: Partial<Restaurant>): Promise<void | Observable<never>> {
    this.loaderService.show();
    return this.db.doc(`restaurants/${id}`).update(restaurant)
               .catch(this.errorHandler.onHttpError)
               .finally(() => {
                 this.loaderService.hide();
               });
  }

  delete(restaurant: Restaurant): Promise<void | Observable<never>> {
    this.loaderService.show();
    return this.db.doc(`restaurants/${restaurant.id}`).delete()
               .catch(this.errorHandler.onHttpError)
               .finally(() => {
                 this.loaderService.hide();
               });
  }

  getRatings(id: string): Observable<Review[]> {
    this.loaderService.show();
    return this.db.collection(`restaurants/${id}/ratings`)
               .snapshotChanges()
               .pipe(
                 map(snaps => convertSnaps<Review>(snaps)),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => {
                   this.loaderService.hide();
                 })
               );
  }
}
