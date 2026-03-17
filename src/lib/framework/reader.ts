// Framework Reader — lê arquivos locais do AIOX
// Funciona apenas em localhost (Node.js runtime)
// Em produção (Vercel), retorna contexto pré-indexado do Supabase

import fs from 'fs'
import path from 'path'
import type { AIOXAgent, AIOXFrameworkContext } from '@/types'

const AIOX_PATH = process.env.AIOX_FRAMEWORK_PATH || path.join(process.cwd(), '..')
const RULES_PATH = path.join(AIOX_PATH, '.claude/rules')
const VERSION_PATH = path.join(AIOX_PATH, '.aiox-core/version.json')

// Todos os namespaces de agentes
const AGENT_NAMESPACES = [
  { namespace: 'AIOX', dir: '.claude/commands/AIOX/agents' },
  { namespace: 'chiefs', dir: '.claude/commands/chiefs/agents' },
  { namespace: 'claude-code-mastery', dir: '.claude/commands/claude-code-mastery/agents' },
  { namespace: 'design-system', dir: '.claude/commands/design-system/agents' },
  { namespace: 'cohort-squad', dir: '.claude/commands/cohort-squad/agents' },
]

function isLocalEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export async function readAgents(): Promise<AIOXAgent[]> {
  if (!isLocalEnvironment()) return []

  const agents: AIOXAgent[] = []

  for (const { namespace, dir } of AGENT_NAMESPACES) {
    const agentsPath = path.join(AIOX_PATH, dir)
    try {
      const files = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'))
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(agentsPath, file), 'utf-8')
          const agent = parseAgentFile(content, file, agentsPath, namespace)
          if (agent) agents.push(agent)
        } catch {}
      }
    } catch {}
  }

  return agents
}

export async function readRules(): Promise<string[]> {
  if (!isLocalEnvironment()) return []

  try {
    const files = fs.readdirSync(RULES_PATH).filter(f => f.endsWith('.md'))
    return files.map(f => f.replace('.md', ''))
  } catch {
    return []
  }
}

export async function readRuleContent(ruleName: string): Promise<string | null> {
  if (!isLocalEnvironment()) return null

  try {
    const filePath = path.join(RULES_PATH, `${ruleName}.md`)
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

export async function readFrameworkVersion(): Promise<string> {
  try {
    const content = fs.readFileSync(VERSION_PATH, 'utf-8')
    const json = JSON.parse(content)
    return json.version || 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function getFrameworkContext(): Promise<AIOXFrameworkContext> {
  const [agents, rules, version] = await Promise.all([
    readAgents(),
    readRules(),
    readFrameworkVersion(),
  ])

  return {
    agents,
    rules,
    version,
    lastUpdated: new Date().toISOString(),
  }
}

function parseAgentFile(
  content: string,
  filename: string,
  agentsPath: string,
  namespace: string
): AIOXAgent | null {
  try {
    const nameMatch = content.match(/^\s*name:\s*([^\n]+)/m)
    const idMatch = content.match(/^\s*id:\s*([^\n]+)/m)
    const titleMatch = content.match(/^\s*title:\s*([^\n]+)/m)
    const roleMatch = content.match(/^\s*role:\s*([^\n]+)/m)
    const whenToUseMatch = content.match(/whenToUse:\s*\|?\s*\n?([\s\S]*?)(?=\n\S|\ncommands:|$)/)

    const name = nameMatch?.[1]?.trim() || filename.replace('.md', '')
    const id = idMatch?.[1]?.trim() || filename.replace('.md', '')

    const commandMatches = [...content.matchAll(/- name:\s*([^\n]+)/g)]
    const commands = commandMatches.map(m => m[1].trim()).slice(0, 10)

    // Activation command: /{namespace}:agents:{id}
    const activationCmd = `/${namespace}:agents:${id}`

    return {
      id,
      name,
      persona: name,
      role: titleMatch?.[1]?.trim() || roleMatch?.[1]?.trim() || '',
      scope: '',
      whenToUse: whenToUseMatch?.[1]?.trim().slice(0, 200) || '',
      commands,
      filePath: path.join(agentsPath, filename),
      namespace,
      activationCmd,
    }
  } catch {
    return null
  }
}

export interface SearchResult {
  id: string
  file: string
  filePath: string
  type: 'agent' | 'rule' | 'task'
  label: string
  excerpt: string
  matchedLine: string
}

export async function searchFramework(query: string): Promise<SearchResult[]> {
  if (!isLocalEnvironment()) return []
  if (!query.trim() || query.length < 2) return []

  const results: SearchResult[] = []
  const q = query.toLowerCase()

  const TASKS_PATH = path.join(AIOX_PATH, '.aiox-core/development/tasks')

  // Search agents across all namespaces
  for (const { namespace, dir } of AGENT_NAMESPACES) {
    try {
      const agentsPath = path.join(AIOX_PATH, dir)
      const files = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'))
      for (const file of files) {
        const content = fs.readFileSync(path.join(agentsPath, file), 'utf-8')
        if (content.toLowerCase().includes(q)) {
          const lines = content.split('\n').filter(Boolean)
          const matchLine = lines.find(l => l.toLowerCase().includes(q)) || ''
          const nameMatch = content.match(/name:\s*([^\n]+)/)
          results.push({
            id: `agent-${namespace}-${file}`,
            file: file.replace('.md', ''),
            filePath: `${dir}/${file}`,
            type: 'agent',
            label: nameMatch?.[1]?.trim() || file.replace('.md', ''),
            excerpt: lines.slice(0, 3).join(' ').slice(0, 150),
            matchedLine: matchLine.trim().slice(0, 120),
          })
        }
      }
    } catch {}
  }

  // Search rules
  try {
    const files = fs.readdirSync(RULES_PATH).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const content = fs.readFileSync(path.join(RULES_PATH, file), 'utf-8')
      if (content.toLowerCase().includes(q)) {
        const lines = content.split('\n').filter(Boolean)
        const matchLine = lines.find(l => l.toLowerCase().includes(q)) || ''
        const titleMatch = content.match(/^#\s+(.+)/)
        results.push({
          id: `rule-${file}`,
          file: file.replace('.md', ''),
          filePath: `rules/${file}`,
          type: 'rule',
          label: titleMatch?.[1]?.trim() || file.replace('.md', '').replace(/-/g, ' '),
          excerpt: lines.slice(0, 3).join(' ').slice(0, 150),
          matchedLine: matchLine.trim().slice(0, 120),
        })
      }
    }
  } catch {}

  // Search tasks
  try {
    const files = fs.readdirSync(TASKS_PATH).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const content = fs.readFileSync(path.join(TASKS_PATH, file), 'utf-8')
      if (content.toLowerCase().includes(q)) {
        const lines = content.split('\n').filter(Boolean)
        const matchLine = lines.find(l => l.toLowerCase().includes(q)) || ''
        const titleMatch = content.match(/^#\s+(.+)/)
        results.push({
          id: `task-${file}`,
          file: file.replace('.md', ''),
          filePath: `tasks/${file}`,
          type: 'task',
          label: titleMatch?.[1]?.trim() || file.replace('.md', '').replace(/-/g, ' '),
          excerpt: lines.slice(0, 3).join(' ').slice(0, 150),
          matchedLine: matchLine.trim().slice(0, 120),
        })
      }
    }
  } catch {}

  return results.slice(0, 25)
}

export async function readFileContent(filePath: string): Promise<string | null> {
  if (!isLocalEnvironment()) return null
  try {
    const fullPath = path.join(AIOX_PATH, filePath.replace(/^(agents|rules|tasks)\//, (match, type) => {
      if (type === 'agents') return '.claude/commands/AIOX/agents/'
      if (type === 'rules') return '.claude/rules/'
      return '.aiox-core/development/tasks/'
    }))
    return fs.readFileSync(fullPath, 'utf-8')
  } catch {
    return null
  }
}

// Contexto compacto para system prompt da IA (respeita rate limit Groq)
export async function getCompactContextForAI(): Promise<string> {
  const agents = await readAgents()
  const version = await readFrameworkVersion()

  const agentsSummary = agents
    .map(a => `- **${a.name}** (${a.id}): ${a.whenToUse?.slice(0, 100) || a.role}`)
    .join('\n')

  return `# AIOX Framework v${version}

## Agentes disponíveis (${agents.length})
${agentsSummary}

## Regras do framework
Ver /claude/rules/ para agent-authority, workflow-execution, story-lifecycle, autonomous-chaining.`
}
