'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Map,
  Compass,
  BookOpen,
  MessageSquare,
  GitBranch,
  Layers,
  Radio,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const nav = [
  {
    section: 'O Framework',
    items: [
      { href: '/framework/mapa', icon: Map, label: 'Mapa', tooltip: 'Mapa visual de todos os agentes e conexões' },
      { href: '/framework/wiki', icon: BookOpen, label: 'Wiki', tooltip: 'Referência navegável do framework' },
      { href: '/framework/chat', icon: MessageSquare, label: 'Chat', tooltip: 'Converse sobre o framework' },
      { href: '/framework/layers', icon: Layers, label: 'Camadas', tooltip: 'Adicione capacidades sem quebrar nada' },
    ],
  },
  {
    section: 'O Direcionador',
    items: [
      { href: '/direcionador/chat', icon: Compass, label: 'Direção', tooltip: 'Qual caminho seguir agora?' },
      { href: '/direcionador/decisoes', icon: GitBranch, label: 'Decisões', tooltip: 'Histórico de decisões e padrões' },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/sentinela', icon: Radio, label: 'Sentinela', tooltip: 'Atualizações do framework upstream' },
      { href: '/configuracoes', icon: Settings, label: 'Config', tooltip: 'Preferências e conexões' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-14 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-12 items-center justify-center border-b border-border">
          <span className="text-xs font-bold tracking-widest text-muted-foreground">AX</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto">
          {nav.map((section) => (
            <div key={section.section} className="mb-3">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-muted-foreground">{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
              {section !== nav[nav.length - 1] && (
                <div className="my-2 h-px bg-border" />
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 border-t border-border p-2">
          <ThemeToggle />
        </div>
      </aside>
    </TooltipProvider>
  )
}
