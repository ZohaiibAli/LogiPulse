import { createBrowserRouter } from "react-router-dom"
import {
  LayoutDashboard, PackagePlus, ListOrdered, UserRound,
  Bike, Wallet, Users, ShieldCheck, Boxes, MapPinned,
} from "lucide-react"

import MarketingLayout from "@/components/layouts/MarketingLayout"
import DashboardShell, { type NavItem } from "@/components/layouts/DashboardShell"
import ProtectedRoute from "@/components/ProtectedRoute"

import Landing from "@/pages/public/Landing"
import LoginSelect from "@/pages/public/LoginSelect"
import CustomerLogin from "@/pages/public/CustomerLogin"
import RiderLogin from "@/pages/public/RiderLogin"
import AdminLogin from "@/pages/public/AdminLogin"
import Register from "@/pages/public/Register"
import ForgotPassword from "@/pages/public/ForgotPassword"
import ResetPassword from "@/pages/public/ResetPassword"
import NoMatch from "@/pages/NoMatch"
import Error500 from "@/pages/Error500"
import Profile from "@/pages/Profile"

import CustomerDashboard from "@/pages/customer/CustomerDashboard"
import BookCourier from "@/pages/customer/BookCourier"
import MyOrders from "@/pages/customer/MyOrders"
import OrderDetail from "@/pages/customer/OrderDetail"

import RiderDashboard from "@/pages/rider/RiderDashboard"
import RiderOrders from "@/pages/rider/RiderOrders"
import RiderOrderDetail from "@/pages/rider/RiderOrderDetail"
import RiderEarnings from "@/pages/rider/RiderEarnings"

import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminRiders from "@/pages/admin/AdminRiders"
import AdminOrders from "@/pages/admin/AdminOrders"
import AdminLiveMap from "@/pages/admin/AdminLiveMap"

const iconCls = "h-4 w-4"

const customerNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: <LayoutDashboard className={iconCls} />, end: true },
  { to: "/app/book", label: "Book a courier", icon: <PackagePlus className={iconCls} /> },
  { to: "/app/orders", label: "My orders", icon: <ListOrdered className={iconCls} /> },
  { to: "/app/profile", label: "Profile", icon: <UserRound className={iconCls} /> },
]

const riderNav: NavItem[] = [
  { to: "/rider", label: "Dashboard", icon: <LayoutDashboard className={iconCls} />, end: true },
  { to: "/rider/orders", label: "History", icon: <ListOrdered className={iconCls} /> },
  { to: "/rider/earnings", label: "Earnings", icon: <Wallet className={iconCls} /> },
  { to: "/rider/profile", label: "Profile", icon: <UserRound className={iconCls} /> },
]

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className={iconCls} />, end: true },
  { to: "/admin/map", label: "Live map", icon: <MapPinned className={iconCls} /> },
  { to: "/admin/riders", label: "Rider approvals", icon: <ShieldCheck className={iconCls} /> },
  { to: "/admin/users", label: "Users", icon: <Users className={iconCls} /> },
  { to: "/admin/orders", label: "Orders", icon: <Boxes className={iconCls} /> },
  { to: "/admin/profile", label: "Profile", icon: <UserRound className={iconCls} /> },
]

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [{ path: "/", element: <Landing /> }],
  },
  { path: "/login", element: <LoginSelect /> },
  { path: "/login/customer", element: <CustomerLogin /> },
  { path: "/login/rider", element: <RiderLogin /> },
  { path: "/login/admin", element: <AdminLogin /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  {
    element: <ProtectedRoute allow={["customer"]} />,
    children: [
      {
        path: "/app",
        element: <DashboardShell navItems={customerNav} roleLabel="Customer" />,
        children: [
          { index: true, element: <CustomerDashboard /> },
          { path: "book", element: <BookCourier /> },
          { path: "orders", element: <MyOrders /> },
          { path: "orders/:id", element: <OrderDetail /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allow={["rider"]} />,
    children: [
      {
        path: "/rider",
        element: <DashboardShell navItems={riderNav} roleLabel="Rider" />,
        children: [
          { index: true, element: <RiderDashboard /> },
          { path: "orders", element: <RiderOrders /> },
          { path: "orders/:id", element: <RiderOrderDetail /> },
          { path: "earnings", element: <RiderEarnings /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allow={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <DashboardShell navItems={adminNav} roleLabel="Admin" />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "map", element: <AdminLiveMap /> },
          { path: "users", element: <AdminUsers /> },
          { path: "riders", element: <AdminRiders /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "orders/:id", element: <OrderDetail /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },

  { path: "/error", element: <Error500 /> },
  { path: "*", element: <NoMatch /> },
], {
  basename: global.basename,
})
