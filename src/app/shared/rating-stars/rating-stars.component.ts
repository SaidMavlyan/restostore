import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements AfterViewInit {

  ratingVal: number;
  stars: Array<any>;
  @Input() showNumberRating = true;
  @Input() isInput = false;
  @Input() numberOfStars = 5;
  @Output() ratingChange = new EventEmitter<number>();
  @ViewChild('ratingStars') elem;

  constructor() {
    this.stars = Array(this.numberOfStars);
  }

  @Input() set rating(value) {
    this.ratingVal = value;
    if (this.elem) {
      this.renderStars();
    }
  }

  ngAfterViewInit() {
    if (this.isInput) {
      this.addListeners();
    }
    this.renderStars();
  }

  renderStars() {
    this.elem.nativeElement.querySelectorAll('.iStar').forEach((el, i) => {
      el.innerHTML = i + 1 > this.ratingVal ? 'star_border' : 'star';
    });
  }

  addListeners() {
    this.elem.nativeElement.querySelectorAll('.iStar')
        .forEach((el, i) => {
          el.addEventListener('click', () => {
            this.ratingChange.emit(i + 1);
          });
        });
  }
}
