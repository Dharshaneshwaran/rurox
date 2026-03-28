export type Role = 'ADMIN' | 'TEACHER';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  teacherId: string | null;
}
