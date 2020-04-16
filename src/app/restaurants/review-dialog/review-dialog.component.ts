import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Review } from '../models/review';
import { Restaurant } from '../models/restaurant';
import { UserService } from '../../users/services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { ReviewService } from '../services/review.service';
import * as moment from 'moment';

const TEXT_MAX_LEN = 500;
const SORTABLE_DATE = 'YYYY-MM-DD';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent implements OnInit {

  review: Partial<Review>;
  form: FormGroup;
  isEditing = false;
  isSaving = false;
  restaurant: Restaurant;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private reviewService: ReviewService,
              private notifierService: NotifierService,
              private userService: UserService,
              private dialogRef: MatDialogRef<ReviewDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { restaurant: Restaurant, review: Review }) {

    this.restaurant = data.restaurant;
    this.review = {};

    if (data.review && data.review.id) {
      this.isEditing = true;
      this.review = data.review;
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      rating: [this.review.rating || 1, [Validators.required]],
      comment: [this.review.comment || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
      dateOfVisit: [this.review.dateOfVisit ? moment(this.review.dateOfVisit, SORTABLE_DATE) : moment()],
    });
  }

  getValidationMessage(field: string) {
    if (field === 'rating') {
      return 'You must rate between 1 and 5';
    }

    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    switch (field) {
      case 'comment':
        return this.form.controls.comment.hasError('maxlength') ?
          `Comment should be at most ${TEXT_MAX_LEN} characters` : '';
      default:
        return 'Please enter correct value';
    }
  }

  async save(isEditing: boolean) {
    this.isSaving = true;
    let result: Review;

    try {
      if (isEditing) {
        result = await this.reviewService.updateReview(this.prepareForm({...this.review, ...this.form.value}));
      } else {
        result = await this.reviewService.addReview(this.restaurant.id, this.prepareForm(this.form.value));
      }

      this.dialogRef.close(result);
    } catch (e) {
      this.notifierService.error(e);
    } finally {
      this.isSaving = false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  prepareForm(form: any) {
    return {...form, dateOfVisit: form.dateOfVisit.format(SORTABLE_DATE)};
  }
}
