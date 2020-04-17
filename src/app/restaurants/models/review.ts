import { User } from '../../users/models/user';

export interface Reply {
  text: string;
  authorId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  restaurantId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: string;
  reply: Reply;
}
