import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  Order, OrderEstimate, User, AdminStats, ChatMessage, RiderProfile, UserRole, OnlineRider,
} from "@/types"

// ---------- Orders ----------

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: async () => (await api.get<Order[]>("/orders/mine")).data,
    refetchInterval: 15000,
  })
}

export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => (await api.get<Order>(`/orders/${orderId}`)).data,
    enabled: !!orderId,
  })
}

export function useAvailableOrders() {
  return useQuery({
    queryKey: ["orders", "available"],
    queryFn: async () => (await api.get<Order[]>("/orders/available")).data,
    refetchInterval: 8000,
  })
}

export function useEstimate() {
  return useMutation({
    mutationFn: async (payload: { pickup_lat: number; pickup_lng: number; dropoff_lat: number; dropoff_lng: number }) =>
      (await api.post<OrderEstimate>("/orders/estimate", payload)).data,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post<Order>("/orders", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}

export function useAcceptOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number) => (await api.post<Order>(`/orders/${orderId}/accept`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: number; status: string; note?: string }) =>
      (await api.patch<Order>(`/orders/${orderId}/status`, { status, note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number) => (await api.post<Order>(`/orders/${orderId}/cancel`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}

// ---------- Rider ----------

export function useRiderProfile() {
  return useQuery({
    queryKey: ["riders", "me"],
    queryFn: async () => (await api.get<RiderProfile>("/riders/me")).data,
  })
}

export function useToggleOnline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (is_online: boolean) => (await api.patch<RiderProfile>("/riders/me/online", { is_online })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riders", "me"] }),
  })
}

export function useUpdateRiderLocation() {
  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) =>
      (await api.patch<RiderProfile>("/riders/me/location", { lat, lng })).data,
  })
}

// ---------- Chat ----------

export function useChatMessages(orderId?: number) {
  return useQuery({
    queryKey: ["chat", orderId],
    queryFn: async () => (await api.get<ChatMessage[]>(`/orders/${orderId}/messages`)).data,
    enabled: !!orderId,
  })
}

// ---------- Admin ----------

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data,
    refetchInterval: 20000,
  })
}

export function useAdminUsers(role?: UserRole) {
  return useQuery({
    queryKey: ["admin", "users", role],
    queryFn: async () => (await api.get<User[]>("/admin/users", { params: role ? { role } : {} })).data,
  })
}

export function usePendingRiders() {
  return useQuery({
    queryKey: ["admin", "riders", "pending"],
    queryFn: async () => (await api.get<User[]>("/admin/riders/pending")).data,
  })
}

export function useSetRiderApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) =>
      (await api.patch(`/admin/riders/${userId}/approval`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] })
    },
  })
}

export function useOnlineRiders() {
  return useQuery({
    queryKey: ["admin", "riders", "online"],
    queryFn: async () => (await api.get<OnlineRider[]>("/admin/riders/online")).data,
    refetchInterval: 6000,
  })
}

export function useSetUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      (await api.patch(`/admin/users/${userId}/active`, null, { params: { is_active: isActive } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}
