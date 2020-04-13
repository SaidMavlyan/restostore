import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { UserService } from '../../users/services/user.service';

const TEXT_MAX_LEN = 500;

@Component({
  selector: 'app-restaurant-dialog',
  templateUrl: './restaurant-dialog.component.html',
  styleUrls: ['./restaurant-dialog.component.scss'],
})
export class RestaurantDialogComponent implements OnInit {

  restaurant: Partial<Restaurant>;
  form: FormGroup;
  isEditing = false;
  isSaving = false;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private userService: UserService,
              private dialogRef: MatDialogRef<RestaurantDialogComponent>,
              @Inject(MAT_DIALOG_DATA) restaurant: Restaurant) {
    if (restaurant?.id) {
      this.isEditing = true;
    }
    this.restaurant = restaurant || {};
  }

  ngOnInit() {
    const photoID = Math.floor(Math.random() * 22) + 1;
    const photo = 'https://storage.googleapis.com/firestorequickstarts.appspot.com/food_' + photoID + '.png';

    this.form = this.fb.group({
      ownerId: [this.restaurant.ownerId || this.userService.currentUser$.getValue().uid],
      name: [this.restaurant.name || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
      avgRating: 4,
      photo
    });
  }

  getValidationMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    switch (field) {
      case 'name':
        return this.form.controls.name.hasError('maxlength') ?
          `Name should be at most ${TEXT_MAX_LEN} characters` : '';
      default:
        return 'Please enter correct value';
    }
  }

  create() {
    this.isSaving = true;
    this.rs.create(this.form.value)
        .then(() => this.close())
        .finally(() => {
          this.isSaving = false;
        });
  }

  update() {
    this.isSaving = true;
    this.rs.update(this.restaurant.id, this.form.value)
        .then(() => this.close())
        .finally(() => {
          this.isSaving = false;
        });
  }

  close() {
    this.dialogRef.close();
  }
}
