import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { RestoOwnerResolverService } from './services/resto-owner.resolver.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RestaurantsComponent,
      },
      {
        path: 'my-restaurants',
        component: RestaurantsComponent,
        resolve: {
          ownerId: RestoOwnerResolverService
        }
      },
      {
        path: 'restaurants/:id',
        component: RestaurantComponent,
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
