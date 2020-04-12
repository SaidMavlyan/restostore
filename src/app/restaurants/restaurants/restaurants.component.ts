import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RestaurantDialogComponent } from '../restaurant-dialog/restaurant-dialog.component';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../../users/services/user.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {

  dialogConfig = new MatDialogConfig();
  restaurantsByRating: Array<Restaurant> = [];
  currentUserId: string;

  constructor(private db: AngularFirestore,
              private dialog: MatDialog,
              private userService: UserService,
              private loaderService: LoaderService,
              private afAuth: AngularFireAuth,
              private rs: RestaurantService) {

    this.rs.loadRestaurants().subscribe(restaurants => {
      this.restaurantsByRating = restaurants;
    });
  }

  addRestaurant() {
    this.dialogConfig.width = '400px';
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.data = {uid: this.currentUserId};
    this.dialog.open(RestaurantDialogComponent, this.dialogConfig);
  }
}
