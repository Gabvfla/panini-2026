import { useAlbumStore } from '../store/albumStore'
import { GROUPS, SPECIAL_STICKERS } from '../data/album'
import { Flag } from './Flag'
import { useToken } from '../hooks/useToken'
import styles from './MissingView.module.css'

export function MissingView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const token = useToken()
  const setStatus = useAlbumStore((s) => s.setStatus)

  const missingSpecial = SPECIAL_STICKERS.filter((id) => stickers[id]?.status === 'missing')

  const missingByTeam = GROUPS.flatMap((group) =>
    group.teams.map((team) => {
      const missing = Array.from({ length: 20 }, (_, i) => `${team.code}${i + 1}`).filter(
        (id) => stickers[id]?.status === 'missing'
      )
      return { team, group: group.name, missing }
    })
  ).filter((t) => t.missing.length > 0)

  const totalMissing = missingSpecial.length + missingByTeam.reduce((acc, t) => acc + t.missing.length, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>📋</div>
        <div>
          <h1 className={styles.title}>FALTANDO</h1>
          <p className={styles.subtitle}>
            {totalMissing === 0 ? 'Álbum completo! 🏆' : `${totalMissing} figurinhas para completar`}
          </p>
        </div>
      </div>

      {totalMissing === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyTrophy}>🏆</div>
          <div className={styles.emptyTitle}>PARABÉNS!</div>
          <div className={styles.emptyText}>Você completou o álbum da Copa 2026.</div>
        </div>
      )}

      {missingSpecial.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <span className={styles.sectionIcon}>★</span>
              <span className={styles.sectionTitle}>Especiais</span>
            </div>
            <span className={styles.sectionBadge}>{missingSpecial.length}</span>
          </div>
          <div className={styles.chips}>
            {missingSpecial.map((id) => (
              <button key={id} className={`${styles.chip} ${styles.chipSpecial}`} onClick={() => setStatus(id, 'owned', token ?? undefined)}>
                <span className={styles.chipId}>{id}</span>
                <span className={styles.chipPlus}>+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {missingByTeam.map(({ team, missing }) => (
        <div key={team.code} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <Flag iso={team.iso} size="sm" />
              <span className={styles.sectionTitle}>{team.name}</span>
              <span className={styles.sectionCode} style={{ color: team.color }}>{team.code}</span>
            </div>
            <span className={styles.sectionBadge}>{missing.length}</span>
          </div>
          <div className={styles.chips}>
            {missing.map((id) => (
              <button
                key={id}
                className={styles.chip}
                onClick={() => setStatus(id, 'owned', token ?? undefined)}
                style={{ '--chip-color': team.color } as React.CSSProperties}
              >
                <span className={styles.chipId}>{id}</span>
                <span className={styles.chipPlus}>+</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
