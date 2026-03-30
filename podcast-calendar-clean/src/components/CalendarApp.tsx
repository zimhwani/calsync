'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isPast,
  addMonths, subMonths, isToday,
} from 'date-fns'
import MatchCelebration from './MatchCelebration'

const HOSTS = [
  { id: 'mati', name: 'Mati', emoji: '🎙️', color: 'var(--mati)', colorName: '#FF6B35' },
  { id: 'jill', name: 'Jill', emoji: '✨', color: 'var(--jill)', colorName: '#A855F7' },
  { id: 'tahj', name: 'Tahj', emoji: '🔥', color: 'var(--tahj)', colorName: '#22D3EE' },
] as const

type HostId = 'mati' | 'jill' | 'tahj'
type Availability = Record<HostId, string[]> // ISO date strings

function getStoredAvailability(): Availability {
  if (typeof window === 'undefined') return { mati: [], jill: [], tahj: [] }
  try {
    const stored = localStorage.getItem('wlgc-availability')
    return stored ? JSON.parse(stored) : { mati: [], jill: [], tahj: [] }
  } catch {
    return { mati: [], jill: [], tahj: [] }
  }
}

export default function CalendarApp() {
  const [activeHost, setActiveHost] = useState<HostId>('mati')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<Availability>({ mati: [], jill: [], tahj: [] })
  const [celebratingDate, setCelebratingDate] = useState<string | null>(null)
  const [prevMatchCount, setPrevMatchCount] = useState(0)

  useEffect(() => {
    setAvailability(getStoredAvailability())
  }, [])

  useEffect(() => {
    localStorage.setItem('wlgc-availability', JSON.stringify(availability))
  }, [availability])

  const getMatchDates = useCallback(() => {
    const { mati, jill, tahj } = availability
    return mati.filter(d => jill.includes(d) && tahj.includes(d))
  }, [availability])

  // Detect new matches
  useEffect(() => {
    const matches = getMatchDates()
    if (matches.length > prevMatchCount) {
      const newMatch = matches[matches.length - 1]
      setCelebratingDate(newMatch)
      setTimeout(() => setCelebratingDate(null), 4000)
    }
    setPrevMatchCount(matches.length)
  }, [availability, getMatchDates, prevMatchCount])

  const toggleDate = (date: Date) => {
    if (isPast(date) && !isToday(date)) return
    const iso = format(date, 'yyyy-MM-dd')
    setAvailability(prev => {
      const hostDates = prev[activeHost]
      const exists = hostDates.includes(iso)
      return {
        ...prev,
        [activeHost]: exists ? hostDates.filter(d => d !== iso) : [...hostDates, iso],
      }
    })
  }

  const clearHost = (hostId: HostId) => {
    setAvailability(prev => ({ ...prev, [hostId]: [] }))
  }

  const calendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }

  const getDayStatus = (date: Date) => {
    const iso = format(date, 'yyyy-MM-dd')
    const hosts: HostId[] = ['mati', 'jill', 'tahj']
    return hosts.filter(h => availability[h].includes(iso))
  }

  const matches = getMatchDates()
  const host = HOSTS.find(h => h.id === activeHost)!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {celebratingDate && (
        <MatchCelebration date={celebratingDate} onDone={() => setCelebratingDate(null)} />
      )}

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'var(--match)',
              color: '#000',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 4,
              letterSpacing: '0.1em',
            }}>WLGC</div>
            <span style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.05em' }}>SCHEDULING</span>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 22,
            fontWeight: 800,
            margin: '4px 0 0',
            letterSpacing: '-0.02em',
          }}>
            what left the group chat
          </h1>
        </div>

        {/* Match count badge */}
        {matches.length > 0 && (
          <div className="match-glow" style={{
            background: 'var(--match)',
            color: '#000',
            borderRadius: 12,
            padding: '8px 16px',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 14,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20 }}>🎉</div>
            <div>{matches.length} MATCH{matches.length !== 1 ? 'ES' : ''}</div>
          </div>
        )}
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gap: 32 }}>

        {/* Host selector */}
        <section>
          <p style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', margin: '0 0 16px', textTransform: 'uppercase' }}>
            Who are you?
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {HOSTS.map(h => (
              <button
                key={h.id}
                onClick={() => setActiveHost(h.id)}
                style={{
                  background: activeHost === h.id ? h.colorName : 'var(--surface)',
                  color: activeHost === h.id ? '#000' : 'var(--text)',
                  border: `2px solid ${activeHost === h.id ? h.colorName : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  letterSpacing: '-0.01em',
                }}
              >
                <span style={{ fontSize: 22 }}>{h.emoji}</span>
                {h.name}
                {availability[h.id].length > 0 && (
                  <span style={{
                    background: activeHost === h.id ? 'rgba(0,0,0,0.2)' : h.colorName,
                    color: activeHost === h.id ? '#000' : '#000',
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {availability[h.id].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Calendar + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Calendar */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}
              >←</button>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.02em' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}
              >→</button>
            </div>

            {/* Weekday labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', padding: '4px 0', letterSpacing: '0.05em', fontWeight: 700 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {calendarDays().map((day, i) => {
                const iso = format(day, 'yyyy-MM-dd')
                const inMonth = isSameMonth(day, currentMonth)
                const past = isPast(day) && !isToday(day)
                const hostStatuses = getDayStatus(day)
                const isMatch = matches.includes(iso)
                const activeSelected = availability[activeHost].includes(iso)

                return (
                  <button
                    key={i}
                    onClick={() => toggleDate(day)}
                    className={`calendar-day ${!inMonth || past ? 'disabled' : ''} ${isMatch ? 'match-day' : ''}`}
                    disabled={!inMonth || past}
                    style={{
                      background: isMatch
                        ? 'rgba(250, 204, 21, 0.15)'
                        : activeSelected
                          ? `${host.colorName}22`
                          : 'var(--surface2)',
                      border: isMatch
                        ? '2px solid var(--match)'
                        : activeSelected
                          ? `2px solid ${host.colorName}`
                          : '1px solid var(--border)',
                      cursor: !inMonth || past ? 'default' : 'pointer',
                      padding: 0,
                      minHeight: 64,
                      flexDirection: 'column',
                    }}
                    title={inMonth && !past ? `${format(day, 'MMM d')} — click to toggle` : ''}
                  >
                    {/* Date number */}
                    <div style={{
                      padding: '6px 8px',
                      fontSize: 13,
                      fontWeight: isToday(day) ? 700 : 400,
                      color: isMatch ? 'var(--match)' : isToday(day) ? 'var(--text)' : inMonth ? 'var(--text)' : 'var(--muted)',
                      textAlign: 'left',
                      fontFamily: 'Space Mono, monospace',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <span>{format(day, 'd')}</span>
                      {isToday(day) && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: host.colorName, display: 'block', marginTop: 3 }} />
                      )}
                    </div>

                    {/* Host dots */}
                    {hostStatuses.length > 0 && inMonth && (
                      <div style={{ display: 'flex', gap: 3, padding: '0 6px 6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {HOSTS.map(h => (
                          hostStatuses.includes(h.id) && (
                            <div
                              key={h.id}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: h.colorName,
                                boxShadow: `0 0 6px ${h.colorName}88`,
                              }}
                            />
                          )
                        ))}
                      </div>
                    )}

                    {/* Match star */}
                    {isMatch && (
                      <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>⭐</div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {HOSTS.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: h.colorName }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{h.name}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>⭐</span>
                <span style={{ fontSize: 12, color: 'var(--match)' }}>Everyone's free!</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Current host's dates */}
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: `1px solid ${host.colorName}44` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>
                  {host.emoji} {host.name}'s dates
                </div>
                {availability[activeHost].length > 0 && (
                  <button
                    onClick={() => clearHost(activeHost)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em' }}
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>
              {availability[activeHost].length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                  No dates selected yet. Click days on the calendar!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {[...availability[activeHost]].sort().map(d => (
                    <div key={d} className="slide-in" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--surface2)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                    }}>
                      <span>{format(new Date(d + 'T12:00:00'), 'EEE, MMM d')}</span>
                      {matches.includes(d) && <span style={{ color: 'var(--match)' }}>⭐</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matches panel */}
            <div style={{
              background: matches.length > 0 ? 'rgba(250, 204, 21, 0.08)' : 'var(--surface)',
              borderRadius: 16,
              padding: 20,
              border: `1px solid ${matches.length > 0 ? 'var(--match)' : 'var(--border)'}`,
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 16, color: matches.length > 0 ? 'var(--match)' : 'var(--text)' }}>
                🎙️ Recording Matches
              </div>
              {matches.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  No matches yet! All three hosts need to mark the same day as available.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...matches].sort().map(d => (
                    <div key={d} style={{
                      background: 'rgba(250, 204, 21, 0.15)',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--match)' }}>
                        {format(new Date(d + 'T12:00:00'), 'EEEE')}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                        {format(new Date(d + 'T12:00:00'), 'MMMM d, yyyy')}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {HOSTS.map(h => (
                          <div key={h.id} style={{
                            background: h.colorName + '22',
                            border: `1px solid ${h.colorName}`,
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            color: h.colorName,
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                          }}>
                            {h.name.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                AVAILABILITY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HOSTS.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.colorName, flexShrink: 0 }} />
                    <div style={{ fontSize: 13, flex: 1 }}>{h.name}</div>
                    <div style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 13,
                      color: availability[h.id].length > 0 ? h.colorName : 'var(--muted)',
                    }}>
                      {availability[h.id].length} day{availability[h.id].length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
