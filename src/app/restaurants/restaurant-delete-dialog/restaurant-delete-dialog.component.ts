import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Restaurant } from '../models/restaurant';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant-delete-dialog',
  templateUrl: './restaurant-delete-dialog.component.html',
  styleUrls: ['./restaurant-delete-dialog.component.scss']
})
export class RestaurantDeleteDialogComponent {

  restaurant: Restaurant;

  constructor(private dialogRef: MatDialogRef<RestaurantDeleteDialogComponent>,
              private rs: RestaurantService,
              @Inject(MAT_DIALOG_DATA) resto: Restaurant) {
    this.restaurant = resto;
  }

  delete() {
    this.rs.delete(this.restaurant)
        .then(() => {
          this.dialogRef.close(true);
        });
  }

  close() {
    this.dialogRef.close();
  }
}
