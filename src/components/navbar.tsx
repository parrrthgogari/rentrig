'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, ShoppingCart, Menu, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useSession, signOut } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { totalItems } = useCartStore()
  const { data: session } = useSession()
  const user = session?.user ? (session.user as typeof session.user & { role?: string }) : undefined
  const cartCount = totalItems()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary" />
          RentRig
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/equipment" className="text-sm font-medium hover:text-primary transition-colors">
            Browse
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
