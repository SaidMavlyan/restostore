import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements OnInit {

  fullStars = [];
  emptyStars = [];
  halfStar = false;
  @Input() showNumberRating = true;
  @Input() numberOfStars = 5;
  private pRating: number;

  get rating() {
    return this.pRating;
  }

  @Input() set rating(value: number) {
    this.fullStars = Array(Math.trunc(value));
    this.emptyStars = Array(this.numberOfStars - Math.trunc(value));
    this.pRating = value;
  }

  constructor() {
  }

  ngOnInit(): void {
  }
}
