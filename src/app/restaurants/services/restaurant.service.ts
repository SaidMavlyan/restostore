import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { convertSnap, convertSnaps } from '../../services/utils';
import { Restaurant } from '../models/restaurant';
import { Review } from '../models/review';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  last: any;

  constructor(private db: AngularFirestore,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  loadRestaurants({isNext = false, limit = 10, sort = 'desc', rating}): Observable<Restaurant[]> {
    this.loaderService.show();
    if (!isNext) {
      this.last = null;
    }

    return this.db.collection('restaurants',
      ref => {
        let res = ref.orderBy('avgRating', sort as OrderByDirection);

        if (rating >= 0 && rating <= 5) {
          res = res.where('avgRating', '>=', rating)
                   .where('avgRating', '<', rating + 1);
        }

        if (this.last) {
          res = res.startAfter(this.last);
        }

        return res.limit(limit);
      })
               .snapshotChanges()
               .pipe(
                 take(1),
                 map(snaps => {
                   if (snaps.length) {
                     this.last = snaps[snaps.length - 1].payload.doc;
                   }
                   return convertSnaps<Restaurant>(snaps);
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
