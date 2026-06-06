import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "purple" | "green" | "yellow" | "red";
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-500",   text: "text-blue-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-500", text: "text-purple-600" },
  green:  { bg: "bg-emerald-50",  icon: "bg-emerald-500",  text: "text-emerald-600" },
  yellow: { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-500",    text: "text-red-600" },
};

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}
