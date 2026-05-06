import { useState } from 'react'
import { useAlbumStore } from '../store/albumStore'
import { ALL_TEAMS } from '../data/album'
import type { StickerStatus } from '../types'
import styles from './TeamView.module.css'

interface TeamViewProps {
  teamCode: string
}

const STATUS_CYCLE: StickerStatus[] = ['missing', 'owned', 'duplicate']

function nextStatus(current: StickerStatus): StickerStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export function TeamView({ teamCode }: TeamViewProps) {
  const stickers = useAlbumStore((s) => s.stickers)
  const setStatus = useAlbumStore((s) => s.setStatus)
  const setDuplicateCount = useAlbumStore((s) => s.setDuplicateCount)
  const markAll = useAlbumStore((s) => s.markAll)
  const [editingDup, setEditingDup] = useState<string | null>(null)

  const team = ALL_TEAMS.find((t) => t.code === teamCode)
  if (!team) return null

  const ids = Array.from({ length: 20 }, (_, i) => `${teamCode}${i + 1}`)
  const ownedCount = ids.filter((id) => stickers[id]?.status !== 'missing').length

  function handleClick(id: string) {
    const current = stickers[id]?.status ?? 'missing'
    const next = nextStatus(current)
    setStatus(id, next)
  }

  function handleDupCountChange(id: string, val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1) setDuplicateCount(id, n)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.teamName}>{team.name}</div>
          <div className={styles.teamMeta}>
            <span className={styles.teamCodeBadge}>{teamCode}</span>
            <span className={styles.groupBadge}>Grupo {team.group}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.progress}>{ownedCount}/20</span>
          <button
            className={styles.actionBtn}
            onClick={() => markAll(ids, 'owned')}
          >
            Marcar todas
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => markAll(ids, 'missing')}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className={styles.legend}>
        <span className={`${styles.legendItem} ${styles.legendMissing}`}>◻ Faltando</span>
        <span className={`${styles.legendItem} ${styles.legendOwned}`}>◼ Tenho</span>
        <span className={`${styles.legendItem} ${styles.legendDup}`}>⧉ Repetida</span>
      </div>

      <div className={styles.grid}>
        {ids.map((id, idx) => {
          const sticker = stickers[id]
          const status = sticker?.status ?? 'missing'
          const dupCount = sticker?.duplicateCount ?? 1
          return (
            <div
              key={id}
              className={`${styles.card} ${styles[status]}`}
              onClick={() => handleClick(id)}
              title={`Clique para alterar status`}
            >
              <div className={styles.cardNumber}>{idx + 1}</div>
              <div className={styles.cardId}>{id}</div>
              {status === 'duplicate' && (
                <div
                  className={styles.dupBadge}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingDup(editingDup === id ? null : id)
                  }}
                >
                  {editingDup === id ? (
                    <input
                      className={styles.dupInput}
                      type="number"
                      min={1}
                      defaultValue={dupCount}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleDupCountChange(id, e.target.value)}
                      onBlur={() => setEditingDup(null)}
                    />
                  ) : (
                    <span>×{dupCount}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.tip}>
        Clique em uma figurinha para alternar: Faltando → Tenho → Repetida
      </div>
    </div>
  )
}
