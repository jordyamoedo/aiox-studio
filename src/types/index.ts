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

export interface AIOXAgent {
  id: string
  name: string
  persona: string
  role: string
  scope: string
  whenToUse: string
  commands: string[]
  filePath: string
  namespace: string   // 'AIOX' | 'chiefs' | 'claude-code-mastery' | 'design-system' | 'cohort-squad'
  activationCmd: string // e.g. '/AIOX:agents:dev' or '/chiefs:agents:copy-chief'
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
