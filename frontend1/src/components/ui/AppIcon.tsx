type IconName =
  | "dashboard"
  | "swap"
  | "users"
  | "logout"
  | "search"
  | "plus"
  | "arrow-right"
  | "calendar"
  | "sparkles"
  | "book"
  | "clock"
  | "check"
  | "alert"
  | "menu"
  | "mail"
  | "lock"
  | "user"
  | "shield"
  | "bell"
  | "chevron-right"
  | "chevron-down";

type AppIconProps = {
  name: IconName;
  className?: string;
};

const iconPaths: Record<IconName, React.ReactNode> = {
  dashboard: (
    <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
  ),
  swap: (
    <>
      <path d="M7 7h11" />
      <path d="m14 4 4 3-4 3" />
      <path d="M17 17H6" />
      <path d="m10 20-4-3 4-3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M20 8.5a3 3 0 0 1 0 6" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z" />
      <path d="m5 14 .7 1.7L7.5 17l-1.8.8L5 19.5l-.7-1.7L2.5 17l1.8-.8Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
  alert: (
    <>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="m10.29 3.86-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0Z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.97 3.05 7.69 7 9 3.95-1.31 7-4.03 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M15 17H5a2 2 0 0 1-2-2v-1c0-1.16.43-2.28 1.2-3.13L5 10V8a7 7 0 0 1 14 0v2l.8.87A4.5 4.5 0 0 1 21 14v1a2 2 0 0 1-2 2h-4" />
      <path d="M9.73 21a2 2 0 0 0 2.54 0" />
    </>
  ),
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
};

export default function AppIcon({ name, className = "" }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {iconPaths[name]}
    </svg>
  );
}
