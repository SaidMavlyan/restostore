export interface Reply {
  text: string;
  authorId: string;
  createdAt: any;
}

export interface Review {
  userId: string;
  comment: string;
  rating: number;
  dateOfVisit: string;
  createdAt: any;
  reply: Reply;
}
