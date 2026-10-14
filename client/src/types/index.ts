export type UserRole = "customer" | "rider" | "admin"

export type RiderStatus = "pending" | "approved" | "rejected"

export type OrderStatus =
  | "pending"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"

export type PackageType = "document" | "parcel" | "fragile" | "food" | "other"

export interface RiderProfile {
  vehicle_type: string
  vehicle_number?: string | null
  cnic?: string | null
  status: RiderStatus
  is_online: boolean
  current_lat?: number | null
  current_lng?: number | null
  rating: number
  total_deliveries: number
}

export interface User {
  id: number
  full_name: string
  email: string
  phone?: string | null
  role: UserRole
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  rider_profile?: RiderProfile | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface StatusHistoryItem {
  status: OrderStatus
  note?: string | null
  created_at: string
}

export interface Order {
  id: number
  customer: User
  rider?: User | null
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  receiver_name: string
  receiver_phone: string
  package_type: PackageType
  package_weight?: number | null
  notes?: string | null
  distance_km?: number | null
  price: number
  payment_method: string
  status: OrderStatus
  created_at: string
  updated_at: string
  delivered_at?: string | null
  status_history: StatusHistoryItem[]
}

export interface OrderEstimate {
  distance_km: number
  price: number
}

export interface ChatMessage {
  id: number
  order_id: number
  sender_id: number
  message: string
  created_at: string
}

export interface AdminStats {
  total_customers: number
  total_riders: number
  pending_riders: number
  total_orders: number
  active_orders: number
  delivered_orders: number
  revenue: number
}

export interface OnlineRider {
  user_id: number
  full_name: string
  vehicle_type: string
  rating: number
  lat: number
  lng: number
  active_order_id?: number | null
}
