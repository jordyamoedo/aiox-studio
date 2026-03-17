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
    accent: 'framework' as const,
    items: [
      { href: '/framework/mapa', icon: Map, label: 'Mapa', tooltip: 'Mapa visual de todos os agentes e conexões' },
      { href: '/framework/wiki', icon: BookOpen, label: 'Wiki', tooltip: 'Referência navegável do framework' },
      { href: '/framework/chat', icon: MessageSquare, label: 'Chat', tooltip: 'Converse sobre o framework' },
      { href: '/framework/layers', icon: Layers, label: 'Camadas', tooltip: 'Adicione capacidades sem quebrar nada' },
    ],
  },
  {
    section: 'O Direcionador',
    accent: 'direcionador' as const,
    items: [
      { href: '/direcionador/chat', icon: Compass, label: 'Direção', tooltip: 'Qual caminho seguir agora?' },
      { href: '/direcionador/decisoes', icon: GitBranch, label: 'Decisões', tooltip: 'Histórico de decisões e padrões' },
    ],
  },
  {
    section: 'Sistema',
    accent: 'sistema' as const,
    items: [
      { href: '/sentinela', icon: Radio, label: 'Sentinela', tooltip: 'Atualizações do framework upstream' },
      { href: '/configuracoes', icon: Settings, label: 'Config', tooltip: 'Preferências e conexões' },
    ],
  },
]

const ACCENT_ACTIVE: Record<string, string> = {
  framework: 'bg-[hsl(var(--accent-primary)/0.15)] text-[hsl(var(--accent-primary))]',
  direcionador: 'bg-[hsl(var(--accent-direcionador)/0.15)] text-[hsl(var(--accent-direcionador))]',
  sistema: 'bg-secondary text-foreground',
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-14 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-12 items-center justify-center border-b border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--accent-primary))]" aria-label="AIOX">
            <circle cx="10" cy="10" r="3"/>
            <line x1="10" y1="7" x2="10" y2="2"/>
            <line x1="12.6" y1="11.5" x2="17" y2="14"/>
            <line x1="7.4" y1="11.5" x2="3" y2="14"/>
          </svg>
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
                            ? ACCENT_ACTIVE[section.accent]
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
