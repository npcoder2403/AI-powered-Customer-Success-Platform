"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/auth/login");
    } else {
      const user = JSON.parse(stored);
      router.push(user.role === "admin" || user.role === "superadmin" ? "/dashboard" : "/interactions");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
