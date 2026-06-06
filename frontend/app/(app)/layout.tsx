"use client";

import { useAuth } from "@/src/hooks/useAuth";
import Sidebar from "@/src/components/ui/Sidebar";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth(true);

  if (!isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("user")) {
    return <LoadingSpinner text="Redirecting..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
