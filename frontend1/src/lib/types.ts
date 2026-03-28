export type Role = "ADMIN" | "TEACHER";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  teacherId?: string | null;
};

export type TimetableEntry = {
  id?: string;
  teacherId?: string;
  teacher?: { name: string } | null;
  day: "MON" | "TUE" | "WED" | "THU" | "FRI";
  period: number;
  subject: string;
  className: string;
  room?: string | null;
  isSubstitution?: boolean;
};

export type Substitution = {
  id: string;
  day: "MON" | "TUE" | "WED" | "THU" | "FRI";
  period: number;
  date: string;
  autoAssigned: boolean;
  absentTeacher?: { name: string } | null;
  replacementTeacher?: { name: string } | null;
};

export type SpecialClass = {
  id: string;
  date: string;
  fromTime: string;
  toTime: string;
  subject: string;
  className: string;
  notes?: string | null;
};

export type Teacher = {
  id: string;
  name: string;
  subjects: string[];
  workload: number;
};
