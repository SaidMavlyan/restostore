import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { SharedModule } from '../shared/shared.module';
import { RestaurantDialogComponent } from './restaurant-dialog/restaurant-dialog.component';
import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantDeleteDialogComponent } from './restaurant-delete-dialog/restaurant-delete-dialog.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { ReviewDialogComponent } from './review-dialog/review-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReviewsComponent } from './reviews/reviews.component';
import { ReviewDeleteDialogComponent } from './review-delete-dialog/review-delete-dialog.component';
import { ReviewReplyDialogComponent } from './review-reply-dialog/review-reply-dialog.component';
import { ReplyDeleteDialogComponent } from './reply-delete-dialog/reply-delete-dialog.component';


@NgModule({
  declarations: [
    RestaurantsComponent,
    RestaurantDialogComponent,
    RestaurantDeleteDialogComponent,
    RestaurantComponent,
    ReviewDialogComponent,
    ReviewsComponent,
    ReviewDeleteDialogComponent,
    ReviewReplyDialogComponent,
    ReplyDeleteDialogComponent,
  ],
  entryComponents: [
    RestaurantDialogComponent,
    RestaurantDeleteDialogComponent,
    ReviewDialogComponent,
    ReviewDeleteDialogComponent,
    ReviewReplyDialogComponent,
    ReplyDeleteDialogComponent,
  ],
  imports: [
    CommonModule,
    RestaurantsRoutingModule,
    SharedModule,
    MatCheckboxModule
  ]
})
export class RestaurantsModule {
}
