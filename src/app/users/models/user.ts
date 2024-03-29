export type Role = 'admin' | 'owner' | 'user';

export interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  role: Role;
  email: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}
