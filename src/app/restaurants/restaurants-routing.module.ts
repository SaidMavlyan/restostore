import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { RestaurantDetailResolverService } from './restaurant-detail-resolver.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RestaurantsComponent
      },
      {
        path: 'restaurants/:id',
        component: RestaurantComponent,
        resolve: {
          restaurant: RestaurantDetailResolverService
        }

      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule {
}
