import { Component, Input, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() restaurantId: string;
  reviews: Review[];

  constructor(private reviewService: ReviewService
  ) {
  }

  ngOnInit(): void {
    this.reviewService.getReviews(this.restaurantId)
        .subscribe(reviews => {
          this.reviews = reviews;
        });
  }
}
