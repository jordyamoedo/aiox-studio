'use client'

import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
]

const FRAMEWORK_PATH = process.env.NEXT_PUBLIC_AIOX_FRAMEWORK_PATH || '/home/amoedo/Projetos/AIOX'

export function ConfiguracoesView() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Aparência */}
        <div>
          <p className="text-sm font-medium mb-3">Aparência</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  theme === id
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary)/0.08)]'
                    : 'border-border bg-card hover:bg-secondary'
                )}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">{label}</span>
                {theme === id && (
                  <Check className="h-3 w-3 text-[hsl(var(--accent-primary))]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Framework */}
        <div>
          <p className="text-sm font-medium mb-3">Framework local</p>
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Caminho configurado</p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                {FRAMEWORK_PATH}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Para alterar</p>
              <p className="text-xs text-muted-foreground">
                Edite <code className="font-mono bg-secondary px-1 rounded">AIOX_FRAMEWORK_PATH</code> no
                arquivo <code className="font-mono bg-secondary px-1 rounded">.env.local</code> e reinicie o servidor.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Groq */}
        <div>
          <p className="text-sm font-medium mb-3">IA (Groq)</p>
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Modelo</p>
                <p className="text-xs text-muted-foreground mt-0.5">llama-3.3-70b-versatile</p>
              </div>
              <Badge variant="secondary" className="text-xs">Free tier</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Rate limit</p>
                <p className="text-xs text-muted-foreground mt-0.5">30 req/min · 14.4k tokens/min</p>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                API key configurada em{' '}
                <code className="font-mono bg-secondary px-1 rounded">.env.local</code>.
                Obtenha em{' '}
                <span className="text-[hsl(var(--accent-primary))]">console.groq.com</span>.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* About */}
        <div>
          <p className="text-sm font-medium mb-3">Sobre</p>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">AIOX Studio</p>
              <Badge variant="outline" className="text-xs">v0.1.0</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema operacional pessoal do Jordy. Conecta o AIOX Framework ao raciocínio e decisões do dia a dia.
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Repo:{' '}
                <code className="font-mono bg-secondary px-1 rounded">jordyamoedo/aiox-studio</code>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
