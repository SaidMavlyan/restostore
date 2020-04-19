import { User } from './user';

export interface Reply {
  text: string;
  userId: string;
  user?: User;
  createdAt: any;
  modifiedAt?: any;
}

export interface Review {
  userId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: any;
  reply: Reply;
}
