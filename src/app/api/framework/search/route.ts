import { NextRequest, NextResponse } from 'next/server'
import { searchFramework, readFileContent } from '@/lib/framework/reader'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const file = searchParams.get('file')

  if (file) {
    const content = await readFileContent(file)
    return NextResponse.json({ content: content || '' })
  }

  const results = await searchFramework(q)
  return NextResponse.json({ results })
}
