import { TestBed } from '@angular/core/testing';

import { RestaurantDetailResolverService } from './restaurant-detail-resolver.service';

describe('RestaurantDetailResolverService', () => {
  let service: RestaurantDetailResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantDetailResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
