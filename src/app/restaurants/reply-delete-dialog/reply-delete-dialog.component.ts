import { Component, Inject } from '@angular/core';
import { Review } from '../models/review';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from '../../services/notifier.service';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-reply-delete-dialog',
  templateUrl: './reply-delete-dialog.component.html',
  styleUrls: ['./reply-delete-dialog.component.scss']
})
export class ReplyDeleteDialogComponent {
  isDeleting = false;
  review: Review;

  constructor(private dialogRef: MatDialogRef<ReplyDeleteDialogComponent>,
              private notifierService: NotifierService,
              private reviewService: ReviewService,
              @Inject(MAT_DIALOG_DATA) review: Review) {
    this.review = review;
  }

  async delete() {
    this.isDeleting = true;

    try {
      await this.reviewService.deleteReply(this.review);
      this.dialogRef.close(true);
    } catch (e) {
      this.notifierService.error(e);
    } finally {
      this.isDeleting = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
