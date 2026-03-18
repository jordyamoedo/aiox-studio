'use client'

import { useState, useEffect } from 'react'

export interface Checkin {
  energy: number       // 1-5
  focusArea: string
  externalContext: string | null
  date: string         // YYYY-MM-DD
}

const STORAGE_KEY = 'aiox-studio-checkin'

export function useDailyCheckin() {
  const [checkin, setCheckinState] = useState<Checkin | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored: Checkin = JSON.parse(raw)
        if (stored.date === today) {
          setCheckinState(stored)
        }
      }
    } catch {}
    setLoaded(true)
  }, [])

  const setCheckin = (data: Omit<Checkin, 'date'>) => {
    const today = new Date().toISOString().slice(0, 10)
    const full: Checkin = { ...data, date: today }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
    } catch {}
    setCheckinState(full)
  }

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setCheckinState(null)
  }

  return { checkin, setCheckin, reset, loaded }
}
