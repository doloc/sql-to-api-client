'use client'

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear any auth tokens or user data from localStorage
    localStorage.removeItem('token')
    // Redirect to login page
    router.push('/login')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Logout</span>
    </Button>
  )
} 