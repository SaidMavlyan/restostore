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
import { NotifierService } from '../../services/notifier.service';
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

  private loadMore$ = new Subject<number>();
  appliedFilter = 'Filter restaurants by rating';

  constructor(private db: AngularFirestore,
              private dialog: MatDialog,
              private userService: UserService,
              private loaderService: LoaderService,
              private notifierService: NotifierService,
              private afAuth: AngularFireAuth,
              private rs: RestaurantService) {
    if (this.rs.lastQuery.sort) {
      this.sort = this.rs.lastQuery.sort;
    }

    if (this.rs.lastQuery.rating) {
      this.ratingFilter = isNaN(this.rs.lastQuery.rating) ? this.ratingFilter : String(this.rs.lastQuery.rating);
    }

    this.applyFilter();
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
    this.dialog.open(RestaurantDialogComponent, this.dialogConfig).afterClosed()
        .subscribe((v) => {
          if (v) {
            this.notifierService.info('Successfully created new restaurant');
            this.loadRestaurants(false);
          }
        });
  }

  applyFilter() {
    this.loadRestaurants(false);
    const res = this.ratingFilter === this.ratingOptions[0] ? 'All' : ` ${this.ratingFilter} star`;
    this.appliedFilter = `${res} restaurats in ${this.sort} order`;
  }

  loadRestaurants(isNext = false) {

    this.isLoading = true;

    this.rs.loadRestaurants({isNext, sort: this.sort, rating: Number(this.ratingFilter)}).subscribe(res => {
      if (isNext) {
        this.restaurants.push(...res);
      } else {
        this.restaurants = res;
      }
      this.isLoading = false;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (isWindowBottom()) {
      this.loadMore$.next(1);
    }
  }
}

