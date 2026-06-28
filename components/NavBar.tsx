'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/dashboard/spending', label: 'Spending', icon: '📊' },
  { href: '/dashboard/transactions', label: 'History', icon: '🧾' },
  { href: '/dashboard/investments', label: 'Invest', icon: '📈' },
  { href: '/dashboard/coach', label: 'Coach', icon: '💡' },
]

export default function NavBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
      {NAV.map(item => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
