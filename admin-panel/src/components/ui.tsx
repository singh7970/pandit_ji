"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: "saffron" | "maroon" | "green" | "blue";
}

const colorMap = {
  saffron: "bg-orange-50 text-saffron-600",
  maroon: "bg-red-50 text-maroon-500",
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatCard({ title, value, subtitle, icon, trend, color = "saffron" }: StatCardProps) {
  return (
    <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-start gap-4">
      <div className={clsx("p-3 rounded-xl", colorMap[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-heading font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={clsx("flex items-center gap-1 text-xs mt-1.5 font-medium", trend >= 0 ? "text-green-600" : "text-red-500")}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}

interface BadgeProps { children: React.ReactNode; color?: string }
export function Badge({ children, color = "gray" }: BadgeProps) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", map[color] || map.gray)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <span className="text-2xl">🕉️</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
