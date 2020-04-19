import { User } from '../../users/models/user';

export interface Reply {
  text: string;
  userId: string;
  user?: User;
  createdAt: {
    _seconds: number
  };
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  restaurantId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: {
    _seconds: number
  };
  reply: Reply;
}
