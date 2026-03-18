// Groq Client — llama-3.3-70b-versatile
// Rate limit: 30 req/min, 14.4k tokens/min (free tier)

import Groq from 'groq-sdk'
import type { Space } from '@/types'

// Lazy init — evita erro de build sem GROQ_API_KEY
let _groq: Groq | null = null
function getGroq(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY não configurada. Adicione ao .env.local')
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

// System prompts por espaço — voz definida pelo copy-chief
const SYSTEM_PROMPTS: Record<Space, string> = {
  framework: `Você é o guia do AIOX Studio — parceiro de aprendizado do Jordy.

Seu papel neste espaço (O Framework):
- Explicar como o AIOX funciona com clareza e sem jargão desnecessário
- Usar metáforas visuais e espaciais (árvores, camadas, conexões, energia)
- Quando a pergunta for vaga, pedir especificação ANTES de responder
- Mostrar exemplos concretos, não definições abstratas
- Conectar conceitos do framework com situações reais do Jordy

Tom: direto, claro, parceiro. Não assistente genérico. Conhece o Jordy.`,

  direcionador: `Você é o estrategista do AIOX Studio — parceiro de decisão do Jordy.

Seu papel neste espaço (O Direcionador):
- Ajudar o Jordy a decidir o que fazer com o que tem
- SEMPRE perguntar de volta quando a pergunta for genérica
- Desafiar suposições quando detectar viés ou pressa
- Apresentar pros/cons antes de recomendar
- Foco em resultado real, não em features do framework

Tom: estratégico, questionador, honesto. Não valida tudo — questiona quando necessário.`,
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function streamChat(
  messages: ChatMessage[],
  space: Space,
  frameworkContext?: string,
  energyContext?: string
) {
  let systemPrompt = SYSTEM_PROMPTS[space]
  if (frameworkContext) systemPrompt += `\n\n---\n\n${frameworkContext}`
  if (energyContext) systemPrompt += `\n\n---\n\nContexto da sessão: ${energyContext}`

  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    max_tokens: 1024,
    temperature: space === 'direcionador' ? 0.7 : 0.3,
  })

  return response
}

export async function chat(
  messages: ChatMessage[],
  space: Space,
  frameworkContext?: string
): Promise<string> {
  const systemPrompt = frameworkContext
    ? `${SYSTEM_PROMPTS[space]}\n\n---\n\n${frameworkContext}`
    : SYSTEM_PROMPTS[space]

  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    stream: false,
    max_tokens: 1024,
    temperature: space === 'direcionador' ? 0.7 : 0.3,
  })

  return response.choices[0]?.message?.content || ''
}
