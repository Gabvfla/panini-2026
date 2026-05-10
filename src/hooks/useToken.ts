import { useAuthStore } from '../store/authStore'

export function useToken(): string | null {
  return useAuthStore((s) => s.token)
}
