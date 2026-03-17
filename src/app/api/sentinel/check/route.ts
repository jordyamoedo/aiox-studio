import { NextResponse } from 'next/server'
import { readFrameworkVersion } from '@/lib/framework/reader'

export async function GET() {
  const localVersion = await readFrameworkVersion()

  try {
    // Busca a versão mais recente do upstream (repositório público do AIOX)
    const res = await fetch(
      'https://api.github.com/repos/synkra-io/aiox/contents/.aiox-core/version.json',
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'aiox-studio',
        },
        next: { revalidate: 3600 }, // cache 1h
      }
    )

    if (!res.ok) {
      return NextResponse.json({
        localVersion,
        upstreamVersion: null,
        hasUpdate: false,
        error: 'Repositório upstream não acessível',
        checkedAt: new Date().toISOString(),
      })
    }

    const upstream = await res.json()
    const upstreamVersion = upstream.version || 'unknown'
    const hasUpdate = upstreamVersion !== localVersion && upstreamVersion !== 'unknown'

    return NextResponse.json({
      localVersion,
      upstreamVersion,
      hasUpdate,
      checkedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({
      localVersion,
      upstreamVersion: null,
      hasUpdate: false,
      error: 'Sem acesso ao upstream agora',
      checkedAt: new Date().toISOString(),
    })
  }
}
