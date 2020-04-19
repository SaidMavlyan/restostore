import { Component, Input, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { BehaviorSubject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Restaurant } from '../models/restaurant';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() restaurant: Restaurant;

  isOwnedResto: boolean;
  isAdmin: boolean;
  myReview: Review;
  reviews$: BehaviorSubject<Review[]>;
  dialogConfig = new MatDialogConfig();

  private filterName = null;
  isLoading: boolean;

  constructor(private reviewService: ReviewService,
              private userService: UserService,
              private dialog: MatDialog) {
    this.dialogConfig.width = '400px';
    this.reviewService.reviews$.next([]);
    this.reviews$ = this.reviewService.reviews$;
  }

  ngOnInit() {
    this.getMyReview();
    this.userService.currentUser$.subscribe(user => {
      this.isOwnedResto = user && user.uid === this.restaurant.ownerId;
      this.isAdmin = user && user.isAdmin;
    });
  }

  tabChange($event: MatTabChangeEvent) {

    this.filterName = $event.index === 1 ? 'reply' : null;
    this.loadReviews(true);

  }

  async getMyReview() {
    this.myReview = await this.reviewService.getMyReview(this.restaurant.id);
  }

  addReview() {
    this.dialogConfig.autoFocus = false;
    this.dialogConfig.data = {restaurant: this.restaurant};
    this.dialog.open(ReviewDialogComponent, this.dialogConfig);
  }

  loadReviews(reset = false) {
    this.isLoading = true;

    const body = {
      isReset: reset || !this.reviewService.reviews$.value.length,
      filterName: this.filterName,
      filterVal: null
    };

    this.reviewService.getReviews(this.restaurant.id, body).finally(() => {
      this.isLoading = false;
    });

  }
}
