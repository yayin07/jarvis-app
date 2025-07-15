"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/lib/types" // <-- use shared User type

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error(await response.text() || "Login failed")
          }

          const user = await response.json()
          set({ user, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Login failed",
            isLoading: false,
          })
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          })

          if (!response.ok) {
            throw new Error(await response.text() || "Registration failed")
          }

          const user = await response.json()
          set({ user, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Registration failed",
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({ user: null })
        localStorage.removeItem("auth-storage")
      },

      checkAuth: async () => {
        try {
          const response = await fetch("/api/auth/me")
          if (!response.ok) set({ user: null })
        } catch {
          set({ user: null })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  )
)
