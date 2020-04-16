import { Component, Input, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReviewDeleteDialogComponent } from '../review-delete-dialog/review-delete-dialog.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() restaurantId: string;
  reviews: Review[];
  dialogConfig = new MatDialogConfig();

  constructor(private reviewService: ReviewService,
              private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.reviewService.getReviews(this.restaurantId, {limit: 10, page: 0})
        .subscribe(result => {
            this.reviews = result.reviews;
          }
        );
  }

  editReview(review: Review) {
    console.log('will edit', review);
  }

  deleteReview(review: Review) {
    this.dialogConfig.data = review;
    this.dialog.open(ReviewDeleteDialogComponent, this.dialogConfig);
  }
}
