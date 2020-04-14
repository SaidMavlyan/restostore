import OrderByDirection = firebase.firestore.OrderByDirection;

export interface RestaurantsQueryParams {
  isNext?: boolean;
  limit?: number;
  sort?: OrderByDirection;
  rating?: number;
}
