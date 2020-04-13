import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RestaurantDialogComponent } from '../restaurant-dialog/restaurant-dialog.component';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../../users/services/user.service';
import { LoaderService } from '../../services/loader.service';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { isWindowBottom } from '../../services/utils';
import OrderByDirection = firebase.firestore.OrderByDirection;

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {

  dialogConfig = new MatDialogConfig();
  restaurants: Array<Restaurant> = [];
  sort: OrderByDirection = 'desc';

  canAdd: boolean;
  ratingFilter = 'all';
  private loadMore$ = new Subject<number>();

  constructor(private db: AngularFirestore,
              private dialog: MatDialog,
              private userService: UserService,
              private loaderService: LoaderService,
              private afAuth: AngularFireAuth,
              private rs: RestaurantService) {
    this.loadRestaurants();
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.canAdd = user.isAdmin || user.isOwner;
      } else {
        this.canAdd = false;
      }
    });

    this.loadMore$.pipe(
      throttleTime(1500)
    ).subscribe(() => {
      this.loadRestaurants(this.restaurants.length > 0);
    });
  }

  addRestaurant() {
    this.dialogConfig.width = '400px';
    this.dialogConfig.autoFocus = true;
    this.dialog.open(RestaurantDialogComponent, this.dialogConfig);
  }

  applyFilter() {
    this.loadRestaurants(false);
  }

  loadRestaurants(isNext = false) {
    if (!isNext) {
      this.restaurants = [];
    }

    this.rs.loadRestaurants({isNext, sort: this.sort, rating: Number(this.ratingFilter)}).subscribe(res => {
      this.restaurants.push(...res);
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (isWindowBottom()) {
      this.loadMore$.next(1);
    }

  }

}

