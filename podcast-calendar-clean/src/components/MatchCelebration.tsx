'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Props {
  date: string
  onDone: () => void
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const CONFETTI_COLORS = ['#FF6B35', '#A855F7', '#22D3EE', '#FACC15', '#FF6B9D', '#00F5D4']

export default function MatchCelebration({ date, onDone }: Props) {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number; size: number; shape: string }[]>([])

  useEffect(() => {
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: rand(0, 100),
      color: CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length))],
      delay: rand(0, 1.5),
      size: rand(8, 16),
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }))
    setPieces(newPieces)

    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  const displayDate = format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d')

  return (
    <div
      onClick={onDone}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}
    >
      {/* Confetti */}
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.6,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${rand(2.5, 4)}s`,
          }}
        />
      ))}

      {/* Card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--match)',
          borderRadius: 24,
          padding: '48px 56px',
          textAlign: 'center',
          maxWidth: 480,
          position: 'relative',
          boxShadow: '0 0 80px rgba(250, 204, 21, 0.3)',
          animation: 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Stars decoration */}
        <div style={{ fontSize: 48, marginBottom: 8, letterSpacing: '0.1em' }}>
          ⭐ 🎙️ ⭐
        </div>

        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 32,
          color: 'var(--match)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          GROUP CHAT<br />JUST ALIGNED
        </div>

        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 14,
          color: 'var(--muted)',
          marginBottom: 24,
          letterSpacing: '0.05em',
        }}>
          ALL THREE HOSTS AVAILABLE ON
        </div>

        <div style={{
          background: 'rgba(250, 204, 21, 0.1)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 26,
            color: 'var(--match)',
            letterSpacing: '-0.02em',
          }}>
            {displayDate}
          </div>
        </div>

        {/* Host badges */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {[
            { name: 'Mati', color: '#FF6B35', emoji: '🎙️' },
            { name: 'Jill', color: '#A855F7', emoji: '✨' },
            { name: 'Tahj', color: '#22D3EE', emoji: '🔥' },
          ].map(h => (
            <div key={h.name} style={{
              background: h.color + '22',
              border: `2px solid ${h.color}`,
              borderRadius: 12,
              padding: '10px 16px',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              color: h.color,
            }}>
              {h.emoji} {h.name}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 11,
          color: 'var(--muted)',
          letterSpacing: '0.1em',
        }}>
          TAP ANYWHERE TO CLOSE
        </div>
      </div>
    </div>
  )
}
