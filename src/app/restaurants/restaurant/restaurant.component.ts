import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { RestaurantDialogComponent } from '../restaurant-dialog/restaurant-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RestaurantDeleteDialogComponent } from '../restaurant-delete-dialog/restaurant-delete-dialog.component';
import { mergeMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { placeholderImage } from '../../const/util';
import { ReviewService } from '../services/review.service';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/models/user';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {

  restaurant: Restaurant;
  placeholder = placeholderImage;
  dialogConfig = new MatDialogConfig();
  user: User;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private reviewService: ReviewService,
              private userService: UserService,
              private dialog: MatDialog,
              private rs: RestaurantService) {
    this.dialogConfig.width = '400px';
    this.userService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.rs.get(id).pipe(
      mergeMap(restaurant => {
        if (restaurant) {
          return of(restaurant);
        } else {
          this.router.navigate(['/']);
          return EMPTY;
        }
      })).subscribe((restaurant: Restaurant) => {
      this.restaurant = restaurant;
    });
  }

  editRestaurant() {
    this.dialogConfig.autoFocus = false;
    this.dialogConfig.data = this.restaurant;
    this.dialog.open(RestaurantDialogComponent, this.dialogConfig);
  }

  deleteRestaurant() {
    this.dialogConfig.data = this.restaurant;
    this.dialog.open(RestaurantDeleteDialogComponent, this.dialogConfig);
  }
}
