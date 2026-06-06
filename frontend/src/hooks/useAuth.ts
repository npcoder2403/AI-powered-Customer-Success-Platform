"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/src/store/store";
import { loadFromStorage, fetchProfile } from "@/src/store/authSlice";

export function useAuth(requireAuth = true) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadFromStorage());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("user")) {
      router.push("/auth/login");
    }
  }, [requireAuth, isAuthenticated, router]);

  return { user, isAuthenticated };
}
