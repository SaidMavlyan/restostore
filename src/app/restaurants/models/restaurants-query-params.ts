import OrderByDirection = firebase.firestore.OrderByDirection;

export interface RestaurantsQueryParams {
  isReset?: boolean;
  limit?: number;
  sort?: OrderByDirection;
  rating?: number;
}
