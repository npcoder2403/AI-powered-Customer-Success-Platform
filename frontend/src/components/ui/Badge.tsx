type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  warning: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  danger:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  info:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  default: { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400" },
};

const autoVariant: Record<string, BadgeVariant> = {
  active: "success", inactive: "default", lead: "info", churned: "danger",
  Positive: "success", Neutral: "warning", Negative: "danger",
  meeting: "info", call: "success", email: "default", demo: "warning", support: "danger",
  admin: "info", user: "default",
};

export default function Badge({ children, variant, dot = true }: BadgeProps) {
  const resolved = variant || autoVariant[String(children)] || "default";
  const s = variantStyles[resolved];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      <span className="capitalize">{children}</span>
    </span>
  );
}
