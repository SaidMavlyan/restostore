import { Component, Input } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { BehaviorSubject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Restaurant } from '../models/restaurant';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {

  @Input() restaurant: Restaurant;
  reviews$: BehaviorSubject<Review[]>;
  private filterName = null;

  constructor(private reviewService: ReviewService,
  ) {
    this.reviewService.reviews$.next([]);
    this.reviews$ = this.reviewService.reviews$;
  }

  tabChange($event: MatTabChangeEvent) {

    this.filterName = $event.index === 1 ? 'reply' : null;
    this.loadReviews(true);

  }

  loadReviews(reset = false) {
    const body = {
      isReset: reset || !this.reviewService.reviews$.value.length,
      filterName: this.filterName,
      filterVal: null
    };

    this.reviewService.getReviews(this.restaurant.id, body);
  }
}
