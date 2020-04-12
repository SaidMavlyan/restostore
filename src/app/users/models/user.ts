export type Role = 'admin' | 'owner' | 'user';

export interface User {
    uid: string;
    displayName: string;
    role: Role;
    email: string;
}
