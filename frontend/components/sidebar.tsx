'use client'

import { Home, ShoppingCart, Package, Grid, DollarSign, Users, BarChart3, User, Settings, LogOut, Tag, ShoppingBag, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Vendas', icon: Tag, href: '/vendas' },
  { name: 'Caixa', icon: Wallet, href: '/caixa' },
  { name: 'Pedidos', icon: Package, href: '/pedidos' },
  { name: 'Produtos', icon: Grid, href: '/produtos' },
  { name: 'Compras', icon: ShoppingBag, href: '/compras' },
  { name: 'Finanças', icon: DollarSign, href: '/financas' },
  { name: 'Clientes', icon: Users, href: '/clientes' },
  { name: 'Estatísticas', icon: BarChart3, href: '/estatisticas' },
  { name: 'Usuários', icon: User, href: '/usuarios' },
  { name: 'Configurações', icon: Settings, href: '/configuracoes' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-48 bg-[#3d5a80] flex flex-col">
      {/* Logo */}
      <div className="h-32 flex items-center justify-center bg-[#4d6a90] text-white font-bold text-lg">
        Logo
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-white transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sair Button */}
      <div className="p-4 border-t border-white/20">
        <button className="flex items-center gap-3 px-6 py-3 text-white hover:bg-white/10 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  )
}
