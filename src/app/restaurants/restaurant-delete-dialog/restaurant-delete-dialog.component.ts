import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Restaurant } from '../models/restaurant';
import { RestaurantService } from '../services/restaurant.service';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-restaurant-delete-dialog',
  templateUrl: './restaurant-delete-dialog.component.html',
  styleUrls: ['./restaurant-delete-dialog.component.scss']
})
export class RestaurantDeleteDialogComponent {

  isDeleting = false;
  restaurant: Restaurant;

  constructor(private dialogRef: MatDialogRef<RestaurantDeleteDialogComponent>,
              private notifierService: NotifierService,
              private rs: RestaurantService,
              @Inject(MAT_DIALOG_DATA) resto: Restaurant) {
    this.restaurant = resto;
  }

  delete() {
    this.isDeleting = true;
    this.rs.delete(this.restaurant)
        .then(() => {
          this.notifierService.info(`${this.restaurant.name} was successfully deleted.`);
          this.dialogRef.close(true);
        })
        .catch((e) => {
          this.notifierService.error(`${this.restaurant.name} could not be deleted. ${e}`);
        })
        .finally(() => {
          this.isDeleting = false;
        });
  }

  close() {
    this.dialogRef.close();
  }
}
