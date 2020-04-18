import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../models/review';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { ReviewDeleteDialogComponent } from '../review-delete-dialog/review-delete-dialog.component';
import { ReviewReplyDialogComponent } from '../review-reply-dialog/review-reply-dialog.component';
import { ReplyDeleteDialogComponent } from '../reply-delete-dialog/reply-delete-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent implements OnInit {

  dialogConfig = new MatDialogConfig();
  @Input() review: Review;

  constructor(private dialog: MatDialog
  ) {
    this.dialogConfig.width = '400px';
  }

  ngOnInit(): void {
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
