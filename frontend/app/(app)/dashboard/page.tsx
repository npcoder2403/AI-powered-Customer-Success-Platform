"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchMetrics } from "@/src/store/dashboardSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import PageHeader from "@/src/components/ui/PageHeader";
import StatCard from "@/src/components/ui/StatCard";
import Card from "@/src/components/ui/Card";
import { Users, MessageSquare, TrendingUp, Minus, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      router.replace("/interactions");
    }
  }, [user, router]);
  const { metrics, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => { dispatch(fetchMetrics()); }, [dispatch]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!metrics) return null;

  const sentimentData = metrics.sentiment_distribution.filter((s) => s.count > 0);
  const sentimentTotal = metrics.sentiment_distribution.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your customer success metrics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <StatCard label="Total Customers" value={metrics.total_customers} icon={Users} color="blue" />
        <StatCard label="Total Interactions" value={metrics.total_interactions} icon={MessageSquare} color="purple" />
        <StatCard label="Positive" value={metrics.positive_sentiments} icon={TrendingUp} color="green" />
        <StatCard label="Neutral" value={metrics.neutral_sentiments} icon={Minus} color="yellow" />
        <StatCard label="Negative" value={metrics.negative_sentiments} icon={TrendingDown} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Customer Growth</h3>
          <p className="text-xs text-slate-400 mb-6">New customers over time</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={metrics.customer_growth}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorGrowth)" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Interactions Per Month</h3>
          <p className="text-xs text-slate-400 mb-6">Monthly interaction volume</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.interactions_per_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Sentiment Distribution</h3>
        <p className="text-xs text-slate-400 mb-6">AI-analyzed sentiment across all interactions</p>

        {sentimentTotal === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Minus className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No sentiment data yet</p>
            <p className="text-xs text-slate-400 mt-1">Create interactions with meeting notes to generate AI insights</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="count"
                    nameKey="sentiment"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    label={false}
                  >
                    {sentimentData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} (${sentimentTotal > 0 ? Math.round((Number(value) / sentimentTotal) * 100) : 0}%)`, String(name)]}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-1/2 space-y-3">
              {sentimentData.map((entry, index) => {
                const pct = sentimentTotal > 0 ? Math.round((entry.count / sentimentTotal) * 100) : 0;
                return (
                  <div key={entry.sentiment} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{entry.sentiment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">{entry.count}</p>
                      <p className="text-[11px] text-slate-400">{pct}%</p>
                    </div>
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[index] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
