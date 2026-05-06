import { useAlbumStore } from '../store/albumStore'
import { SPECIAL_STICKERS } from '../data/album'
import type { StickerStatus } from '../types'
import styles from './SpecialView.module.css'

const STATUS_CYCLE: StickerStatus[] = ['missing', 'owned', 'duplicate']

function nextStatus(current: StickerStatus): StickerStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export function SpecialView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const setStatus = useAlbumStore((s) => s.setStatus)
  const markAll = useAlbumStore((s) => s.markAll)

  const ownedCount = SPECIAL_STICKERS.filter(
    (id) => stickers[id]?.status !== 'missing'
  ).length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>FIGURINHAS ESPECIAIS</h1>
          <p className={styles.subtitle}>Abertura do álbum e FIFA World Cup</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.count}>{ownedCount}/{SPECIAL_STICKERS.length}</span>
          <button className={styles.btn} onClick={() => markAll(SPECIAL_STICKERS, 'owned')}>
            Marcar todas
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => markAll(SPECIAL_STICKERS, 'missing')}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {SPECIAL_STICKERS.map((id) => {
          const sticker = stickers[id]
          const status = sticker?.status ?? 'missing'
          return (
            <div
              key={id}
              className={`${styles.card} ${styles[status]}`}
              onClick={() => setStatus(id, nextStatus(status))}
            >
              <div className={styles.starIcon}>★</div>
              <div className={styles.cardId}>{id}</div>
              <div className={styles.statusLabel}>
                {status === 'missing' && 'Falta'}
                {status === 'owned' && 'Tenho'}
                {status === 'duplicate' && 'Repetida'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
