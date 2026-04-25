export type Role = "ADMIN" | "TEACHER" | "STUDENT";

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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "REASSIGNED";
  absentTeacherId?: string | null;
  replacementTeacherId?: string | null;
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

export type Student = {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  teachers?: Array<{ id: string; name: string }>;
  studentTimetables?: Array<{
    id: string;
    day: string;
    period: number;
    subject: string;
    className: string;
    teacher?: string;
    room?: string;
  }>;
};

export type SuggestionCandidate = {
  id: string;
  name: string;
  subjects: string[];
  subjectMatch: boolean;
  workload: number;
};

export type PeriodSuggestion = {
  period: number;
  subject: string;
  className: string;
  room: string | null;
  suggestedTeacher: {
    id: string;
    name: string;
    subjectMatch: boolean;
  } | null;
  allCandidates: SuggestionCandidate[];
};

export type FullDaySuggestionResponse = {
  absentTeacher: { id: string; name: string };
  day: string;
  date: string;
  suggestions: PeriodSuggestion[];
  message?: string;
};
