import { NextRequest, NextResponse } from 'next/server'
import { streamChat } from '@/lib/groq/client'
import { getCompactContextForAI } from '@/lib/framework/reader'
import type { Space, ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, space }: { messages: ChatMessage[]; space: Space } = body

    if (!messages?.length || !space) {
      return NextResponse.json({ error: 'messages e space são obrigatórios' }, { status: 400 })
    }

    // Carrega contexto do framework apenas para o espaço Framework
    const frameworkContext = space === 'framework'
      ? await getCompactContextForAI()
      : undefined

    const stream = await streamChat(messages, space, frameworkContext)

    // Retorna como stream SSE
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}
