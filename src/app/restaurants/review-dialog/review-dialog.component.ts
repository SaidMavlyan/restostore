import { Component, Inject, OnInit } from '@angular/core';
import { Review } from '../models/restaurant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const TEXT_MAX_LEN = 500;
const SORTABLE_DATE = 'YYYY-MM-DD';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent implements OnInit {

  review: Review;
  form: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private dialogRef: MatDialogRef<ReviewDialogComponent>,
              @Inject(MAT_DIALOG_DATA) review: Review) {
    if (review.userId) {
      this.isEditing = true;
    }

    this.review = review;
  }

  ngOnInit() {
    this.form = this.fb.group({
      userId: [this.review.userId],
      // date: [this.review.date ? moment(this.review.date, SORTABLE_DATE) : moment()],
      // time: [this.review.time || moment().format('HH:mm')],
      // description: [this.review.description || '', [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
      text: [this.review.text || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
    });
  }

  getValidationMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    switch (field) {
      case 'description':
        return this.form.controls.description.hasError('maxlength') ?
          `Description should be at most ${TEXT_MAX_LEN} characters` : '';
      case 'name':
        return this.form.controls.name.hasError('maxlength') ?
          `Name should be at most ${TEXT_MAX_LEN} characters` : '';
      default:
        return 'Please enter correct value';
    }
  }

  create() {
    // this.rs.create(this.prepareForm(this.form.value))
    //     .then(() => this.close());
  }

  update() {
    // this.rs.update(this.review.userId, this.prepareForm(this.form.value))
    //     .then(() => this.close());
  }

  close() {
    this.dialogRef.close();
  }

  prepareForm(form: any) {
    return {...form, date: form.date.format(SORTABLE_DATE)};
  }

}
