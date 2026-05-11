import { useState } from 'react'
import { useAlbumStore } from '../store/albumStore'
import { TEAM_MAP } from '../data/album'
import { Flag } from './Flag'
import type { StickerStatus } from '../types'
import styles from './TeamView.module.css'

interface TeamViewProps {
  teamCode: string
}

const STATUS_CYCLE: StickerStatus[] = ['missing', 'owned', 'duplicate']

function nextStatus(current: StickerStatus): StickerStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
}

export function TeamView({ teamCode }: TeamViewProps) {
  const stickers = useAlbumStore((s) => s.stickers)
  const setStatus = useAlbumStore((s) => s.setStatus)
  const setDuplicateCount = useAlbumStore((s) => s.setDuplicateCount)
  const markAll = useAlbumStore((s) => s.markAll)
  const [editingDup, setEditingDup] = useState<string | null>(null)

  const team = TEAM_MAP[teamCode]
  if (!team) return null

  const ids = Array.from({ length: 20 }, (_, i) => `${teamCode}${i + 1}`)
  const ownedCount = ids.filter((id) => stickers[id]?.status !== 'missing').length
  const pct = Math.round((ownedCount / 20) * 100)

  function handleClick(id: string) {
    setStatus(id, nextStatus(stickers[id]?.status ?? 'missing'))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ '--team-color': team.color } as React.CSSProperties}>
        <div className={styles.headerGlow} style={{ background: `radial-gradient(circle, ${team.color}25 0%, transparent 70%)` }} />
        <div className={styles.headerLeft}>
          <Flag iso={team.iso} size="xl" />
          <div>
            <div className={styles.teamName}>{team.name}</div>
            <div className={styles.teamMeta}>
              <span className={styles.teamCodeBadge} style={{ background: `${team.color}22`, color: team.color, borderColor: `${team.color}55` }}>{teamCode}</span>
              <span className={styles.groupBadge}>Grupo {team.group}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <svg viewBox="0 0 80 80" className={styles.ringSmall}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={team.color} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 0.6s ease', opacity: 0.9 }}
            />
            <text x="40" y="37" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontFamily="Bebas Neue" letterSpacing="1">{ownedCount}</text>
            <text x="40" y="49" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="Inter">de 20</text>
          </svg>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={() => markAll(ids, 'owned')}>✓ Marcar todas</button>
            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => markAll(ids, 'missing')}>✕ Limpar</button>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span className={`${styles.legendDot} ${styles.dotMissing}`} />
        <span className={styles.legendText}>Faltando</span>
        <span className={`${styles.legendDot} ${styles.dotOwned}`} />
        <span className={styles.legendText}>Tenho</span>
        <span className={`${styles.legendDot} ${styles.dotDup}`} />
        <span className={styles.legendText}>Repetida</span>
        <span className={styles.legendTip}>· Clique para alternar</span>
      </div>

      <div className={styles.grid}>
        {ids.map((id, idx) => {
          const sticker = stickers[id]
          const status = sticker?.status ?? 'missing'
          const dupCount = sticker?.duplicateCount ?? 1
          return (
            <div
              key={id}
              className={`${styles.card} ${styles[`card_${status}`]}`}
              onClick={() => handleClick(id)}
              style={status !== 'missing' ? { '--team-color': team.color } as React.CSSProperties : undefined}
            >
              <div className={styles.cardNum}>{idx + 1}</div>
              <Flag iso={team.iso} size="md" className={status === 'missing' ? styles.flagMissing : ''} />
              <div className={styles.cardId}>{id}</div>
              {status === 'owned' && <div className={styles.cardCheck}>✓</div>}
              {status === 'duplicate' && (
                <div
                  className={styles.dupBadge}
                  onClick={(e) => { e.stopPropagation(); setEditingDup(editingDup === id ? null : id) }}
                >
                  {editingDup === id ? (
                    <input
                      className={styles.dupInput}
                      type="number" min={1} defaultValue={dupCount} autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { const n = parseInt(e.target.value); if (!isNaN(n) && n >= 1) setDuplicateCount(id, n) }}
                      onBlur={() => setEditingDup(null)}
                    />
                  ) : <span>×{dupCount}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
