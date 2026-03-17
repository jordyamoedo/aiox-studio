// Framework Reader — lê arquivos locais do AIOX
// Funciona apenas em localhost (Node.js runtime)
// Em produção (Vercel), retorna contexto pré-indexado do Supabase

import fs from 'fs'
import path from 'path'
import type { AIOXAgent, AIOXFrameworkContext } from '@/types'

const AIOX_PATH = process.env.AIOX_FRAMEWORK_PATH || path.join(process.cwd(), '..')
const AGENTS_PATH = path.join(AIOX_PATH, '.claude/commands/AIOX/agents')
const RULES_PATH = path.join(AIOX_PATH, '.claude/rules')
const VERSION_PATH = path.join(AIOX_PATH, '.aiox-core/version.json')

function isLocalEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export async function readAgents(): Promise<AIOXAgent[]> {
  if (!isLocalEnvironment()) return []

  try {
    const files = fs.readdirSync(AGENTS_PATH).filter(f => f.endsWith('.md'))
    const agents: AIOXAgent[] = []

    for (const file of files) {
      const content = fs.readFileSync(path.join(AGENTS_PATH, file), 'utf-8')
      const agent = parseAgentFile(content, file)
      if (agent) agents.push(agent)
    }

    return agents
  } catch {
    return []
  }
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

function parseAgentFile(content: string, filename: string): AIOXAgent | null {
  try {
    // Extrai campos do YAML block dentro do arquivo .md
    const nameMatch = content.match(/name:\s*([^\n]+)/)
    const idMatch = content.match(/id:\s*([^\n]+)/)
    const titleMatch = content.match(/title:\s*([^\n]+)/)
    const roleMatch = content.match(/role:\s*([^\n]+)/)
    const whenToUseMatch = content.match(/whenToUse:\s*\|?\s*\n?([\s\S]*?)(?=\n\S|\ncommands:|$)/)

    const name = nameMatch?.[1]?.trim() || filename.replace('.md', '')
    const id = idMatch?.[1]?.trim() || filename.replace('.md', '')

    // Extrai comandos
    const commandMatches = [...content.matchAll(/- name:\s*([^\n]+)/g)]
    const commands = commandMatches.map(m => m[1].trim()).slice(0, 10)

    return {
      id,
      name,
      persona: name,
      role: titleMatch?.[1]?.trim() || roleMatch?.[1]?.trim() || '',
      scope: '',
      whenToUse: whenToUseMatch?.[1]?.trim().slice(0, 200) || '',
      commands,
      filePath: path.join(AGENTS_PATH, filename),
    }
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
