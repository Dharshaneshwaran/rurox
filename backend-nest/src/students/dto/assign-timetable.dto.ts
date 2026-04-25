export class AssignTimetableDto {
  day: string;
  period: number;
  subject: string;
  className: string;
  teacher?: string;
  room?: string;
}
