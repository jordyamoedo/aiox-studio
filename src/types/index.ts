// AIOX Studio — Core Types

export type Space = 'framework' | 'direcionador'

export type MessageRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  role: MessageRole
  content: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  space: Space
  title: string | null
  message_count: number
  created_at: string
  last_used_at: string
}

export interface SessionCheckin {
  id: string
  session_date: string
  energy_level: number // 1-5
  focus_area: string
  external_context: string | null
  created_at: string
}

export interface AgentCommand {
  name: string
  description: string
  args?: string
  visibility?: string[]
}

export interface AIOXAgent {
  id: string
  name: string          // persona name (e.g. "Dex")
  persona: string
  role: string          // agent.title
  scope: string
  whenToUse: string
  commands: string[]    // nomes simples (compatibilidade)
  commandsFull: AgentCommand[]  // comandos com descrição e args
  filePath: string
  namespace: string
  activationCmd: string
  // Identidade
  icon?: string
  archetype?: string
  zodiac?: string
  identity?: string
  style?: string
  tone?: string
  vocabulary?: string[]
  greeting?: string
  signatureClosing?: string
  // Diretrizes
  corePrinciples?: string[]
  customization?: string
  // Dependências
  dependencies?: {
    tasks?: string[]
    templates?: string[]
    checklists?: string[]
    data?: string[]
    utils?: string[]
    workflows?: string[]
  }
}

export interface AIOXFrameworkContext {
  agents: AIOXAgent[]
  rules: string[]
  version: string
  lastUpdated: string
}

export interface SentinelCheck {
  id: string
  checked_at: string
  local_version: string
  upstream_version: string | null
  has_update: boolean
  changes_summary: Record<string, unknown> | null
  recommendations: SentinelRecommendation[] | null
}

export interface SentinelRecommendation {
  type: 'ABSORVER' | 'AVALIAR' | 'IGNORAR'
  component: string
  reason: string
  conflict?: string
}

export type ThemeMode = 'dark' | 'light' | 'system'

export interface UserPreferences {
  theme: ThemeMode
  defaultSpace: Space
  checkinEnabled: boolean
}
