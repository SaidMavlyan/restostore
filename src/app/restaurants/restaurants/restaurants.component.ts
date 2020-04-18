import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RestaurantDialogComponent } from '../restaurant-dialog/restaurant-dialog.component';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../../users/services/user.service';
import { LoaderService } from '../../services/loader.service';
import { placeholderImage } from '../../const/util';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {

  dialogConfig = new MatDialogConfig();
  restaurants: Array<Restaurant> = [];
  ratingOptions = ['all', '0', '1', '2', '3', '4', '5'];
  sort: OrderByDirection = 'desc';
  ratingFilter = this.ratingOptions[0];
  canAdd = false;
  isLoading = false;
  placeholder = placeholderImage;

  filterLabel = 'Filter restaurants by rating';

  constructor(private db: AngularFirestore,
              private dialog: MatDialog,
              private userService: UserService,
              private loaderService: LoaderService,
              private afAuth: AngularFireAuth,
              private rs: RestaurantService) {
    if (this.rs.lastQuery.sort) {
      this.sort = this.rs.lastQuery.sort;
    }

    if (this.rs.lastQuery.rating) {
      this.ratingFilter = isNaN(this.rs.lastQuery.rating) ? this.ratingFilter : String(this.rs.lastQuery.rating);
    }

    this.setFilterLabel();
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.canAdd = user.isAdmin || user.isOwner;
      } else {
        this.canAdd = false;
      }
    });
  }

  setFilterLabel() {
    const res = this.ratingFilter === this.ratingOptions[0] ? 'All' : ` ${this.ratingFilter} star`;
    this.filterLabel = `${res} restaurants in ${this.sort} order`;
  }

  applyFilter() {
    this.setFilterLabel();
    this.loadRestaurants(true);
  }

  addRestaurant() {
    this.dialogConfig.width = '400px';
    this.dialogConfig.autoFocus = true;
    this.dialog.open(RestaurantDialogComponent, this.dialogConfig).afterClosed()
        .subscribe((v) => {
          if (v) {
            this.loadRestaurants(true);
          }
        });
  }

  loadRestaurants(reset = false) {

    this.isLoading = true;
    const isReset = reset || !this.restaurants.length;

    this.rs.loadRestaurants({isReset, sort: this.sort, rating: Number(this.ratingFilter)}).subscribe(res => {
      if (isReset) {
        this.restaurants = res;
      } else {
        this.restaurants.push(...res);
      }
      this.isLoading = false;
    });
  }
}

