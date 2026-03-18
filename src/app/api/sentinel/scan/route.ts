import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const AIOX_PATH = process.env.AIOX_FRAMEWORK_PATH || path.join(process.cwd(), '..')
const VERSION_PATH = path.join(AIOX_PATH, '.aiox-core/version.json')
const AIOX_CORE_PATH = path.join(AIOX_PATH, '.aiox-core')

type RecommendationType = 'ABSORVER' | 'AVALIAR' | 'IGNORAR'

function classifyFile(filePath: string): RecommendationType {
  if (
    filePath.startsWith('core/') ||
    filePath.startsWith('cli/') ||
    filePath.startsWith('schemas/') ||
    filePath.startsWith('elicitation/') ||
    filePath.startsWith('infrastructure/')
  ) return 'ABSORVER'

  if (
    filePath.startsWith('data/') ||
    filePath.startsWith('development/') ||
    filePath.startsWith('scripts/') ||
    filePath.startsWith('product/')
  ) return 'AVALIAR'

  return 'IGNORAR'
}

function fileHash(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath)
    return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex')
  } catch {
    return null
  }
}

function friendlyReason(filePath: string, type: RecommendationType, missing: boolean): string {
  const name = path.basename(filePath)
  if (missing) return `${name} é novo no upstream — não existe na sua versão local`
  if (type === 'ABSORVER') return `${name} foi atualizado. Tipo core — recomendado absorver sem revisão manual`
  return `${name} foi modificado. Pode ter mudanças que conflitam com customizações locais`
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ recommendations: [], total: 0 })
  }

  try {
    const raw = fs.readFileSync(VERSION_PATH, 'utf-8')
    const { fileHashes = {} } = JSON.parse(raw) as { fileHashes?: Record<string, string> }

    const recommendations: Array<{
      type: RecommendationType
      component: string
      reason: string
      conflict?: string
    }> = []

    for (const [rel, storedHash] of Object.entries(fileHashes)) {
      const fullPath = path.join(AIOX_CORE_PATH, rel)
      const current = fileHash(fullPath)
      const type = classifyFile(rel)

      if (!current) {
        if (type !== 'IGNORAR') {
          recommendations.push({ type, component: rel, reason: friendlyReason(rel, type, true) })
        }
        continue
      }

      if (current !== storedHash) {
        const conflict = type === 'AVALIAR'
          ? 'Verifique se você customizou este arquivo antes de aplicar'
          : undefined
        recommendations.push({ type, component: rel, reason: friendlyReason(rel, type, false), conflict })
      }
    }

    const ORDER: Record<RecommendationType, number> = { ABSORVER: 0, AVALIAR: 1, IGNORAR: 2 }
    recommendations.sort((a, b) => ORDER[a.type] - ORDER[b.type])

    return NextResponse.json({ recommendations: recommendations.slice(0, 15), total: recommendations.length })
  } catch {
    return NextResponse.json({ recommendations: [], total: 0, error: 'Erro ao escanear arquivos do framework' })
  }
}
