"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "@/src/store/authSlice";
import { AppDispatch, RootState } from "@/src/store/store";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import PageHeader from "@/src/components/ui/PageHeader";
import { Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  if (loading && !user) return <LoadingSpinner />;
  if (!user) return <div className="text-center py-12 text-slate-500">Unable to load profile</div>;

  const details = [
    { icon: Mail, label: "Email Address", value: user.email },
    { icon: Shield, label: "Role", value: user.role },
    { icon: Calendar, label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile" description="Your account information" />

      <Card>
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge>{user.role}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {details.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
