import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  title: string
  subtitle?: string
  space?: 'framework' | 'direcionador' | 'sistema'
  children: React.ReactNode
  contentClassName?: string
}

export function PageLayout({
  title,
  subtitle,
  space = 'sistema',
  children,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className={cn(
            'flex h-12 items-center border-b border-border px-4 shrink-0',
            space === 'direcionador' && 'border-l-2 border-l-[hsl(var(--accent-direcionador))]'
          )}
        >
          <div>
            <span className="text-sm font-medium">{title}</span>
            {subtitle && (
              <span className="ml-2 text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </header>
        <div className={cn('flex flex-col flex-1 min-h-0 overflow-hidden', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
