import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function AppMark(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9H24V15H8z" fill="currentColor" />
      <path d="M8 18H15V24H8zM18 18H24V24H18z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
    </BaseIcon>
  );
}

export function SwapIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h11" />
      <path d="m12 4 3 3-3 3" />
      <path d="M20 17H9" />
      <path d="m12 20-3-3 3-3" />
    </BaseIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M16 20a4 4 0 0 0-8 0" />
      <circle cx="12" cy="10" r="3.25" />
      <path d="M21 20a4 4 0 0 0-3-3.86" />
      <path d="M18 7.5a3 3 0 1 1 0 5.9" />
    </BaseIcon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 3v4M17 3v4M4 9h16" />
      <rect x="4" y="5.5" width="16" height="14.5" rx="1" />
      <path d="M8 13h3M13 13h3M8 17h3M13 17h3" />
    </BaseIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5.5 6v5.5c0 4.3 2.4 7.3 6.5 9.5 4.1-2.2 6.5-5.2 6.5-9.5V6z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" />
    </BaseIcon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 17v2H5V5h5v2" />
      <path d="M15 16l5-4-5-4" />
      <path d="M20 12H9" />
    </BaseIcon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
      <path d="M8 7h7M8 11h7M8 15h5" />
    </BaseIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </BaseIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m5 12 4.2 4.2L19 6.5" />
    </BaseIcon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4 3.5 19h17z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r=".5" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3v5M12 16v5M4.8 7.8l3.6 2.1M15.6 14.1l3.6 2.1M19.2 7.8l-3.6 2.1M8.4 14.1l-3.6 2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </BaseIcon>
  );
}
