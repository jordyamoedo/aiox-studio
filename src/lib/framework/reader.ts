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
  { namespace: 'synapse', dir: '.claude/commands/synapse' },
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

function extractYamlBlock(content: string): string {
  const match = content.match(/```ya?ml\n([\s\S]*?)```/)
  return match?.[1] || ''
}

function extractListItems(yaml: string, key: string): string[] {
  const pattern = new RegExp(`${key}:\\s*\\n((?:\\s+-[^\\n]+\\n?)*)`, 'm')
  const match = yaml.match(pattern)
  if (!match) return []
  return match[1]
    .split('\n')
    .map(l => l.replace(/^\s+-\s*/, '').trim())
    .filter(Boolean)
}

function extractScalar(yaml: string, key: string): string {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*['\"]?([^'\"\\n]+)['\"]?`, 'm'))
  return match?.[1]?.trim() || ''
}

function extractMultilineScalar(yaml: string, key: string): string {
  const match = yaml.match(new RegExp(`${key}:\\s*[|>]?\\s*'?"?([^'"\\n][\\s\\S]*?)(?=\\n\\s*\\w+:|$)`, 'm'))
  if (!match) {
    const simple = yaml.match(new RegExp(`${key}:\\s*'([^']+)'`))
    if (simple) return simple[1].trim()
    const dbl = yaml.match(new RegExp(`${key}:\\s*"([^"]+)"`))
    if (dbl) return dbl[1].trim()
  }
  return match?.[1]?.trim() || ''
}

function parseCommandsFull(yaml: string): import('@/types').AgentCommand[] {
  const cmds: import('@/types').AgentCommand[] = []
  // Match each command block: - name: X\n    description: Y\n    (args: Z)?
  const cmdSection = yaml.match(/^commands:([\s\S]*?)(?=^\w|\Z)/m)?.[1] || yaml
  const blocks = [...cmdSection.matchAll(/- name:\s*([^\n]+)\n((?:\s+[^\n]+\n?)*)/g)]
  for (const block of blocks) {
    const name = block[1].trim()
    const body = block[2]
    const descMatch = body.match(/description:\s*['"]?([^'"]+)['"]?/)
    const argsMatch = body.match(/args:\s*['"]?([^'"]+)['"]?/)
    const visMatch = body.match(/visibility:\s*\[([^\]]+)\]/)
    cmds.push({
      name,
      description: descMatch?.[1]?.trim() || '',
      args: argsMatch?.[1]?.trim(),
      visibility: visMatch ? visMatch[1].split(',').map(v => v.trim().replace(/['"]/g, '')) : undefined,
    })
  }
  return cmds
}

function parseDependencies(yaml: string): AIOXAgent['dependencies'] {
  const depsSection = yaml.match(/^dependencies:([\s\S]*?)(?=^autoClaude:|^security:|^ids_hooks:|$)/m)?.[1] || ''
  if (!depsSection) return {}

  const extract = (key: string) => {
    const section = depsSection.match(new RegExp(`${key}:\\s*\\n((?:\\s+-[^\\n]+\\n?)*)`, 'm'))
    if (!section) return undefined
    const items = section[1].split('\n').map(l => l.replace(/^\s+-\s*/, '').trim()).filter(Boolean)
    return items.length ? items : undefined
  }

  return {
    tasks: extract('tasks'),
    templates: extract('templates'),
    checklists: extract('checklists'),
    data: extract('data'),
    utils: extract('utils'),
    workflows: extract('workflows'),
  }
}

function parseAgentFile(
  content: string,
  filename: string,
  agentsPath: string,
  namespace: string
): AIOXAgent | null {
  try {
    const yaml = extractYamlBlock(content)
    const src = yaml || content

    // Identidade básica
    const name = extractScalar(src, 'name') || filename.replace('.md', '')
    const id = extractScalar(src, 'id') || filename.replace('.md', '')
    const title = extractScalar(src, 'title').replace(/^["']|["']$/g, '')
    const icon = extractScalar(src, 'icon').replace(/^["']|["']$/g, '')

    // whenToUse — pode ser inline ou multiline
    const whenToUseInline = src.match(/whenToUse:\s*['"]([^'"]+)['"]/)?.[1]
    const whenToUseBlock = src.match(/whenToUse:\s*\|?\s*\n([\s\S]*?)(?=\n\s*\w+:|$)/)?.[1]
      ?.split('\n').map(l => l.trim()).filter(Boolean).join(' ')
    const whenToUse = (whenToUseInline || whenToUseBlock || '').trim()

    // Persona profile
    const archetype = extractScalar(src, 'archetype')
    const zodiac = extractScalar(src, 'zodiac').replace(/^['"]|['"]$/g, '')
    const tone = extractScalar(src, 'tone')
    const vocabulary = extractListItems(src, 'vocabulary')

    // Greeting / closing
    const archetypalGreeting = src.match(/archetypal:\s*['"]([^'"]+)['"]/)?.[1] || ''
    const signatureClosing = src.match(/signature_closing:\s*['"]([^'"]+)['"]/)?.[1] || ''

    // Persona
    const roleMatch = src.match(/^persona:\s*\n[\s\S]*?role:\s*(.+)/m)
    const role = title || roleMatch?.[1]?.trim().replace(/^['"]|['"]$/g, '') || ''
    const style = extractScalar(src, 'style')
    const identity = extractScalar(src, 'identity')

    // Core principles
    const corePrinciples = extractListItems(src, 'core_principles')

    // Customization
    const customizationMatch = src.match(/customization:\s*\|\s*\n([\s\S]*?)(?=\n\w|\ncommands:|$)/)
    const customization = customizationMatch?.[1]?.split('\n').map(l => l.replace(/^\s+/, '')).filter(Boolean).join('\n').trim()

    // Comandos
    const commandsFull = parseCommandsFull(src)
    const commands = commandsFull.map(c => c.name).slice(0, 20)

    // Dependências
    const dependencies = parseDependencies(src)

    const activationCmd = `/${namespace}:agents:${id}`

    return {
      id,
      name,
      persona: name,
      role,
      scope: '',
      whenToUse,
      commands,
      commandsFull,
      filePath: path.join(agentsPath, filename),
      namespace,
      activationCmd,
      icon,
      archetype,
      zodiac,
      identity,
      style,
      tone,
      vocabulary: vocabulary.length ? vocabulary : undefined,
      greeting: archetypalGreeting,
      signatureClosing,
      corePrinciples: corePrinciples.length ? corePrinciples : undefined,
      customization: customization || undefined,
      dependencies: Object.keys(dependencies as object).length ? dependencies : undefined,
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
