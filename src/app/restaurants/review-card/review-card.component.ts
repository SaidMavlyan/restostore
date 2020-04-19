import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../models/review';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { ReviewDeleteDialogComponent } from '../review-delete-dialog/review-delete-dialog.component';
import { ReviewReplyDialogComponent } from '../review-reply-dialog/review-reply-dialog.component';
import { ReplyDeleteDialogComponent } from '../reply-delete-dialog/reply-delete-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/models/user';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent implements OnInit {

  @Input() review: Review;
  @Input() canReply = false;

  user: User;
  dialogConfig = new MatDialogConfig();

  constructor(private dialog: MatDialog,
              private userService: UserService,
  ) {
    this.dialogConfig.width = '400px';
    this.userService.currentUser$.subscribe(user => {
      this.user = user;
    });
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
