import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../models/restaurant';
import { UserService } from '../../users/services/user.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';

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
  uploadPercent$: Observable<number>;
  file: File;

  constructor(private fb: FormBuilder,
              private rs: RestaurantService,
              private storage: AngularFireStorage,
              private notifierService: NotifierService,
              private userService: UserService,
              private dialogRef: MatDialogRef<RestaurantDialogComponent>,
              @Inject(MAT_DIALOG_DATA) restaurant: Restaurant) {
    if (restaurant?.id) {
      this.isEditing = true;
    }
    this.restaurant = restaurant || {};
  }

  ngOnInit() {
    this.form = this.fb.group({
      ownerId: [this.restaurant.ownerId || this.userService.currentUser$.getValue().uid],
      name: [this.restaurant.name || undefined, [Validators.required, Validators.maxLength(TEXT_MAX_LEN)]],
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

  selectFile(event) {
    this.file = event.target.files[0];
  }

  async uploadPhoto(restoId: string): Promise<string> {
    const ownerId = this.form.get('ownerId').value;
    const task = this.storage.upload(`restaurants/${ownerId}/${restoId}/resto_photo`, this.file);

    this.uploadPercent$ = task.percentageChanges();
    const finishedTask = await task;
    return await finishedTask.ref.getDownloadURL();
  }

  async save() {
    this.isSaving = true;

    try {

      let data = {...this.form.value};

      const restoId = this.restaurant.id || await this.rs.create({...data, avgRating: 0, numRatings: 0, pendingReplies: 0});

      if (this.file) {
        data = {...data, photo: await this.uploadPhoto(restoId as string)};
      }

      await this.rs.update(restoId as string, data);

      this.close(true);
    } catch (e) {
      this.notifierService.error(e);
    } finally {
      this.isSaving = false;
    }
  }

  close(status = false) {
    this.dialogRef.close(status);
  }
}
