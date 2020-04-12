import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantDeleteDialogComponent } from './restaurant-delete-dialog.component';

describe('RestaurantDeleteDialogComponent', () => {
  let component: RestaurantDeleteDialogComponent;
  let fixture: ComponentFixture<RestaurantDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
