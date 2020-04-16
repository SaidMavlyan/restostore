import { Review } from './review';

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  photo: string;
  avgRating: number;
  numRatings: number;
  pendingReplies: number;
  ratings: Review[];
}
