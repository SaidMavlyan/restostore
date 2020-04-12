import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant, Review } from '../models/restaurant';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {

  restaurant: Restaurant;
  ratings: Review[];

  constructor(private route: ActivatedRoute, private rs: RestaurantService) {
  }

  ngOnInit(): void {
    this.route.data
        .subscribe((data: { restaurant: Restaurant }) => {
          this.restaurant = data.restaurant;

          this.rs.getRatings(this.restaurant.id).subscribe(ratings => {
            this.ratings = ratings;
          });

        });
  }

  addRating() {

  }
}
