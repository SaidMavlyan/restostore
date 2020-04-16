import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewReplyDialogComponent } from './review-reply-dialog.component';

describe('ReviewReplyDialogComponent', () => {
  let component: ReviewReplyDialogComponent;
  let fixture: ComponentFixture<ReviewReplyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewReplyDialogComponent]
    })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewReplyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
