import { Component, Inject, OnInit } from '@angular/core';
import { Review } from '../models/review';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant } from '../models/restaurant';
import { RestaurantService } from '../services/restaurant.service';
import { ReviewService } from '../services/review.service';
import { NotifierService } from '../../services/notifier.service';
import { UserService } from '../../users/services/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const TEXT_MAX_LEN = 500;

@Component({
  selector: 'app-review-reply-dialog',
  templateUrl: './review-reply-dialog.component.html',
  styleUrls: ['./review-reply-dialog.component.scss']
})
export class ReviewReplyDialogComponent implements OnInit {

  review: Review;
  form: FormGroup;
  isEditing = false;
  isSaving = false;
  restaurant: Restaurant;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private reviewService: ReviewService,
              private notifierService: NotifierService,
              private userService: UserService,
              private dialogRef: MatDialogRef<ReviewReplyDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { review: Review }) {

    this.review = data.review;

    if (data.review && data.review.reply) {
      this.isEditing = true;
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      text: [this.review?.reply?.text || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]]
    });
  }

  getValidationMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    switch (field) {
      case 'text':
        return this.form.controls.text.hasError('maxlength') ?
          `Reply should be at most ${TEXT_MAX_LEN} characters` : '';
      default:
        return 'Please enter correct value';
    }
  }

  async save(isEditing: boolean) {
    this.isSaving = true;

    try {
      if (isEditing) {
        // result = await this.reviewService.updateReply(review, reply);
      } else {
        await this.reviewService.addReply(this.review, this.form.value);
      }

      this.dialogRef.close(true);
    } catch (e) {
      this.notifierService.error(e);
    } finally {
      this.isSaving = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
