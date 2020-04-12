import { Injectable } from '@angular/core';
import { RestaurantService } from './services/restaurant.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { Restaurant } from './models/restaurant';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RestaurantDetailResolverService {
  constructor(private rs: RestaurantService, private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Restaurant> | Observable<never> {
    const id = route.paramMap.get('id');

    return this.rs.get(id).pipe(
      take(1),
      mergeMap(restaurant => {
        if (restaurant) {
          return of(restaurant);
        } else {
          this.router.navigate(['/']);
          return EMPTY;
        }
      })
    );
  }
}
