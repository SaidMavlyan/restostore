export interface Review {
  dateOfVisit: string;
  timestamp: string;
  text: string;
  rating: number;
  userId: string;
}

export interface Restaurant {
  ratings: Review[];
  id: string;
  name: string;
  ownerId: string;
  description: string;
  photo: string;
  date: string;
  time: string;
  avgRating: number;
}

