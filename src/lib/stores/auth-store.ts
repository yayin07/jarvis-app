"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
}

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
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.text()
            throw new Error(error || "Login failed")
          }

          const user = await response.json()
          set({ user, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          })
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          })

          if (!response.ok) {
            const error = await response.text()
            throw new Error(error || "Registration failed")
          }

          const user = await response.json()
          set({ user, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({ user: null })
        // Clear persisted state
        localStorage.removeItem("auth-storage")
      },

      checkAuth: async () => {
        const { user } = get()
        if (!user) return

        try {
          const response = await fetch("/api/auth/me")
          if (!response.ok) {
            set({ user: null })
          }
        } catch (error) {
          set({ user: null })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
