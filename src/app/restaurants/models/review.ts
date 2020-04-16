export interface Reply {
  text: string;
  authorId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName?: string;
  restaurantId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: string;
  reply: Reply;
}
