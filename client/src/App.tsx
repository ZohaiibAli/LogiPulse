import { RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { router } from "./Router"
import { AuthProvider } from "@/contexts/AuthContext"
import { MapsProvider } from "@/contexts/MapsContext"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppShell() {
  const { theme } = useTheme()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme={theme} />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MapsProvider>
            <AppShell />
          </MapsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
