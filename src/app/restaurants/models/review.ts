export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: string;
  reply: object;
}
