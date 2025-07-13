"use client";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { TodoDashboard } from "@/components/dashboard/todo-dashboard";

export default function HomePage() {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <TodoDashboard />;
}
