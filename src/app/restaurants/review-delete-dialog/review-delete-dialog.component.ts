import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from '../../services/notifier.service';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-review-delete-dialog',
  templateUrl: './review-delete-dialog.component.html',
  styleUrls: ['./review-delete-dialog.component.scss']
})
export class ReviewDeleteDialogComponent {

  isDeleting = false;
  review: Review;

  constructor(private dialogRef: MatDialogRef<ReviewDeleteDialogComponent>,
              private notifierService: NotifierService,
              private reviewService: ReviewService,
              @Inject(MAT_DIALOG_DATA) review: Review) {
    this.review = review;
  }

  delete() {
    this.isDeleting = true;
    this.reviewService.deleteReview(this.review)
        .subscribe(() => {
          this.isDeleting = false;
          this.dialogRef.close(true);
        });
  }

  close() {
    this.dialogRef.close();
  }
}
