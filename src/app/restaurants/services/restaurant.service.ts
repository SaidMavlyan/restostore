import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { convertDocs, convertSnap } from '../../services/utils';
import { Restaurant } from '../models/restaurant';
import { RestaurantsQueryParams } from '../models/restaurants-query-params';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  lastSnap: QueryDocumentSnapshot<DocumentData>;
  lastQuery: RestaurantsQueryParams = {};
  private defaultLimit: number;

  constructor(private db: AngularFirestore,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
    this.defaultLimit = Math.ceil(window.innerHeight / 50); // Calculating min number of restos to fill the entire screen
  }

  loadRestaurants({isReset = false, limit = this.defaultLimit, sort = 'desc', rating}: RestaurantsQueryParams): Observable<Restaurant[]> {
    this.loaderService.show();
    this.lastQuery = arguments[0];
    if (isReset) {
      this.lastSnap = null;
    }

    return this.db.collection('restaurants',
      ref => {
        let res = ref.orderBy('avgRating', sort as OrderByDirection)
                     .orderBy('name', 'asc');

        if (rating >= 0 && rating <= 5) {
          res = res.where('avgRating', '>=', rating)
                   .where('avgRating', '<', rating + 1);
        }

        if (this.lastSnap) {
          res = res.startAfter(this.lastSnap);
        }

        return res.limit(limit);
      })
               .get()
               .pipe(
                 take(1),
                 map(querySnapp => {
                   if (querySnapp.size) {
                     this.lastSnap = querySnapp.docs[querySnapp.size - 1];
                   }
                   return convertDocs<Restaurant>(querySnapp.docs);
                 }),
                 finalize(() => {
                   this.loaderService.hide();
                 })
               );
  }

  create(restaurant: Restaurant): Promise<string> {
    this.loaderService.show();
    return this.db.collection('restaurants').add(restaurant)
               .then((res) => {
                 return res.id;
               })
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

  update(id: string, restaurant: Partial<Restaurant>): Promise<void> {
    this.loaderService.show();
    return this.db.doc(`restaurants/${id}`).update(restaurant)
               .finally(() => {
                 this.loaderService.hide();
               });
  }

  delete(restaurant: Restaurant): Promise<void> {
    this.loaderService.show();
    return this.db.doc(`restaurants/${restaurant.id}`).delete()
               .finally(() => {
                 this.loaderService.hide();
               });
  }
}
