import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import * as moment from 'moment';

const TEXT_MAX_LEN = 500;
const SORTABLE_DATE = 'YYYY-MM-DD';

@Component({
  selector: 'app-restaurant-dialog',
  templateUrl: './restaurant-dialog.component.html',
  styleUrls: ['./restaurant-dialog.component.scss'],
})
export class RestaurantDialogComponent implements OnInit {

  restaurant: Restaurant;
  form: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private dialogRef: MatDialogRef<RestaurantDialogComponent>,
              @Inject(MAT_DIALOG_DATA) restaurant: Restaurant) {
    if (restaurant.id) {
      this.isEditing = true;
    }
    this.restaurant = restaurant;
  }

  ngOnInit() {
    this.form = this.fb.group({
      ownerId: [this.restaurant.ownerId],
      name: [this.restaurant.name || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
      description: [this.restaurant.description || '', [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
      date: [this.restaurant.date ? moment(this.restaurant.date, SORTABLE_DATE) : moment()],
      time: [this.restaurant.time || moment().format('HH:mm')],
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
    this.rs.create(this.prepareForm(this.form.value))
        .then(() => this.close());
  }

  update() {
    this.rs.update(this.restaurant.id, this.prepareForm(this.form.value))
        .then(() => this.close());
  }

  close() {
    this.dialogRef.close();
  }

  prepareForm(form: any) {
    return {...form, date: form.date.format(SORTABLE_DATE)};
  }
}
