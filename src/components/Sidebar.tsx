'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  PieChart,
  Settings,
  Menu,
  X,
  DollarSign
} from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', href: '/', active: true },
    { icon: <TrendingUp />, label: 'Receitas', href: '/receitas' },
    { icon: <TrendingDown />, label: 'Despesas', href: '/despesas' },
    { icon: <CreditCard />, label: 'Transações', href: '/transacoes' },
    { icon: <Users />, label: 'Clientes', href: '/clientes' },
    { icon: <PieChart />, label: 'Relatórios', href: '/relatorios' },
    { icon: <Settings />, label: 'Configurações', href: '/configuracoes' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SisFin</h1>
              <p className="text-xs text-gray-500">Sistema Financeiro</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={item.active}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@sisfin.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
