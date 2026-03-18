'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Decision {
  id: string
  title: string
  excerpt: string
  status: 'active' | 'pending' | 'resolved'
  createdAt: string
}

const STORAGE_KEY = 'aiox-studio-decisions'

function load(): Decision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(decisions: Decision[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions))
  } catch {}
}

export function useLocalDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([])

  useEffect(() => {
    setDecisions(load())
  }, [])

  const add = useCallback((data: Omit<Decision, 'id' | 'createdAt'>) => {
    const decision: Decision = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setDecisions(prev => {
      const next = [decision, ...prev]
      persist(next)
      return next
    })
    return decision
  }, [])

  const update = useCallback((id: string, patch: Partial<Decision>) => {
    setDecisions(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...patch } : d)
      persist(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setDecisions(prev => {
      const next = prev.filter(d => d.id !== id)
      persist(next)
      return next
    })
  }, [])

  return { decisions, add, update, remove }
}
