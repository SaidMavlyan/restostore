import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyDeleteDialogComponent } from './reply-delete-dialog.component';

describe('ReplyDeleteDialogComponent', () => {
  let component: ReplyDeleteDialogComponent;
  let fixture: ComponentFixture<ReplyDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReplyDeleteDialogComponent]
    })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
