import { Component, Input, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { BehaviorSubject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Restaurant } from '../models/restaurant';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() restaurant: Restaurant;

  myReview: Review;
  reviews$: BehaviorSubject<Review[]>;
  dialogConfig = new MatDialogConfig();

  private filterName = null;

  constructor(private reviewService: ReviewService,
              private dialog: MatDialog) {
    this.dialogConfig.width = '400px';
    this.reviewService.reviews$.next([]);
    this.reviews$ = this.reviewService.reviews$;
  }

  ngOnInit() {
    this.getMyReview();
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
    const body = {
      isReset: reset || !this.reviewService.reviews$.value.length,
      filterName: this.filterName,
      filterVal: null
    };

    this.reviewService.getReviews(this.restaurant.id, body);
  }
}
