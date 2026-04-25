export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  teacherId: string | null;
}
