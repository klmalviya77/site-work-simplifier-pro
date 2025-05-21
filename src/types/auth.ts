
export type UserRole = 'electrician' | 'contractor' | 'homeowner' | 'guest';

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  name?: string;
  isGuest: boolean;
}
