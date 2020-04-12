import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { SharedModule } from '../shared/shared.module';
import { RestaurantDialogComponent } from './restaurant-dialog/restaurant-dialog.component';
import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantDeleteDialogComponent } from './restaurant-delete-dialog/restaurant-delete-dialog.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { ReviewDialogComponent } from './review-dialog/review-dialog.component';


@NgModule({
  declarations: [
    RestaurantsComponent,
    RestaurantDialogComponent,
    RestaurantDeleteDialogComponent,
    RestaurantComponent,
    ReviewDialogComponent,
  ],
  entryComponents: [
    RestaurantDialogComponent,
    RestaurantDeleteDialogComponent,
    ReviewDialogComponent,
  ],
  imports: [
    CommonModule,
    RestaurantsRoutingModule,
    SharedModule
  ]
})
export class RestaurantsModule {
}
