import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDeleteDialogComponent } from './review-delete-dialog.component';

describe('ReviewDeleteDialogComponent', () => {
  let component: ReviewDeleteDialogComponent;
  let fixture: ComponentFixture<ReviewDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewDeleteDialogComponent]
    })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
