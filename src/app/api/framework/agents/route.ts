import { NextResponse } from 'next/server'
import { readAgents } from '@/lib/framework/reader'

export async function GET() {
  try {
    const agents = await readAgents()
    return NextResponse.json({ agents })
  } catch (error) {
    return NextResponse.json({ agents: [], error: 'Framework path not accessible' }, { status: 200 })
  }
}
