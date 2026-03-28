type BannerTone = "error" | "success" | "info";

type StatusBannerProps = {
  message: string;
  tone?: BannerTone;
};

const toneStyles: Record<BannerTone, string> = {
  error:
    "border-[color:rgba(193,85,85,0.18)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  success:
    "border-[color:rgba(45,123,102,0.18)] bg-[var(--color-success-soft)] text-[var(--color-success)]",
  info:
    "border-[color:rgba(30,109,118,0.18)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

export default function StatusBanner({
  message,
  tone = "info",
}: StatusBannerProps) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-3 text-sm font-medium ${toneStyles[tone]}`}
    >
      {message}
    </div>
  );
}
