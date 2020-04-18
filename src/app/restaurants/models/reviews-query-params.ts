import OrderByDirection = firebase.firestore.OrderByDirection;

export interface ReviewsQueryParams {
  isReset?: boolean;
  limit?: number;
  sort?: OrderByDirection;
  filterName?: string;
  filterVal?: string;
}
