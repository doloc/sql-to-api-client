'use client'

import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/logout-button'

export function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Tool</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isAuthPage && <LogoutButton />}
        </div>
      </div>
    </header>
  )
} 