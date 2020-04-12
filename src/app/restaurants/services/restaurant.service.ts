import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { convertSnaps } from '../../services/utils';
import { Restaurant, Review } from '../models/restaurant';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(private db: AngularFirestore,
              private loaderService: LoaderService,
              private errorHandler: ErrorHandlerService) {
  }

  loadRestaurants(): Observable<Restaurant[]> {
    return this.db.collection('restaurants',
      ref => ref.orderBy('avgRating', 'desc').limit(10))
               .snapshotChanges()
               .pipe(map(snaps => convertSnaps<Restaurant>(snaps)));
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
    this.loaderService.show();
    return this.db.doc(`restaurants/${id}`).get().pipe(
      map(snap => ({id: snap.id, ...snap.data()} as Restaurant)),
      catchError(this.errorHandler.onHttpError),
      finalize(() => {
        this.loaderService.hide();
      })
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
               .finally(this.loaderService.hide);
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
