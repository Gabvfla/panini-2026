import { useAlbumStore } from '../store/albumStore'
import { SPECIAL_STICKERS } from '../data/album'
import type { StickerStatus } from '../types'
import { useToken } from '../hooks/useToken'
import styles from './SpecialView.module.css'

const STATUS_CYCLE: StickerStatus[] = ['missing', 'owned', 'duplicate']

function nextStatus(current: StickerStatus): StickerStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
}

export function SpecialView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const token = useToken()
  const setStatus = useAlbumStore((s) => s.setStatus)
  const markAll = useAlbumStore((s) => s.markAll)

  const ownedCount = SPECIAL_STICKERS.filter((id) => stickers[id]?.status !== 'missing').length
  const pct = Math.round((ownedCount / SPECIAL_STICKERS.length) * 100)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerGlow} />
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>🏆</div>
          <div>
            <h1 className={styles.title}>ESPECIAIS</h1>
            <p className={styles.subtitle}>Figurinha de abertura e coleção FIFA World Cup</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.ringWrap}>
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="url(#goldGrad)" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a16207" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <text x="40" y="37" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontFamily="Bebas Neue" letterSpacing="1">{ownedCount}</text>
              <text x="40" y="49" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="Inter">de {SPECIAL_STICKERS.length}</text>
            </svg>
          </div>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={() => markAll(SPECIAL_STICKERS, 'owned', token ?? undefined)}>✓ Marcar todas</button>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => markAll(SPECIAL_STICKERS, 'missing', token ?? undefined)}>✕ Limpar</button>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {SPECIAL_STICKERS.map((id) => {
          const status = stickers[id]?.status ?? 'missing'
          const isSpecial = id === '00'
          return (
            <div
              key={id}
              className={`${styles.card} ${styles[`card_${status}`]} ${isSpecial ? styles.cardSpecial : ''}`}
              onClick={() => setStatus(id, nextStatus(status), token ?? undefined)}
            >
              <div className={styles.cardShine} />
              <div className={styles.cardStar}>{isSpecial ? '⚽' : '★'}</div>
              <div className={styles.cardId}>{id}</div>
              <div className={styles.cardStatus}>
                {status === 'missing' && 'falta'}
                {status === 'owned' && 'tenho'}
                {status === 'duplicate' && 'repete'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
