import OrderByDirection = firebase.firestore.OrderByDirection;

export interface ReviewsQueryParams {
  isNext?: boolean;
  limit?: number;
  sort?: OrderByDirection;
  filterName?: string;
  filterVal?: string;
}
