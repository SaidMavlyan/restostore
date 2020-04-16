import { Component, Input, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReviewDeleteDialogComponent } from '../review-delete-dialog/review-delete-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { ReviewReplyDialogComponent } from '../review-reply-dialog/review-reply-dialog.component';
import { ReplyDeleteDialogComponent } from '../reply-delete-dialog/reply-delete-dialog.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() restaurantId: string;
  dialogConfig = new MatDialogConfig();
  reviews$: BehaviorSubject<Review[]>;

  constructor(private reviewService: ReviewService,
              private dialog: MatDialog,
  ) {
    this.dialogConfig.width = '400px';
  }

  ngOnInit(): void {
    this.reviewService.getReviews(this.restaurantId, {limit: 10, page: 0})
        .subscribe();

    this.reviews$ = this.reviewService.reviews$;
  }

  editReview(review: Review) {
    this.dialogConfig.data = {review};
    this.dialog.open(ReviewDialogComponent, this.dialogConfig);
  }

  deleteReview(review: Review) {
    this.dialogConfig.data = review;
    this.dialog.open(ReviewDeleteDialogComponent, this.dialogConfig);
  }

  setReply(review: Review) {
    this.dialogConfig.data = {review};
    this.dialog.open(ReviewReplyDialogComponent, this.dialogConfig);
  }

  deleteReply(review: Review) {
    this.dialogConfig.data = review;
    this.dialog.open(ReplyDeleteDialogComponent, this.dialogConfig);
  }

}
