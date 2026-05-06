import { useAlbumStore } from '../store/albumStore'
import { GROUPS, SPECIAL_STICKERS } from '../data/album'
import styles from './MissingView.module.css'

export function MissingView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const setStatus = useAlbumStore((s) => s.setStatus)

  const missingSpecial = SPECIAL_STICKERS.filter(
    (id) => stickers[id]?.status === 'missing'
  )

  const missingByTeam = GROUPS.flatMap((group) =>
    group.teams.map((team) => {
      const missing = Array.from({ length: 20 }, (_, i) => `${team.code}${i + 1}`).filter(
        (id) => stickers[id]?.status === 'missing'
      )
      return { team, group: group.name, missing }
    })
  ).filter((t) => t.missing.length > 0)

  const totalMissing =
    missingSpecial.length + missingByTeam.reduce((acc, t) => acc + t.missing.length, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>FIGURINHAS FALTANDO</h1>
          <p className={styles.subtitle}>{totalMissing} figurinhas para completar o álbum</p>
        </div>
      </div>

      {totalMissing === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏆</div>
          <div className={styles.emptyTitle}>Álbum Completo!</div>
          <div className={styles.emptyText}>Parabéns, você tem todas as figurinhas.</div>
        </div>
      )}

      {missingSpecial.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>★ Especiais</span>
            <span className={styles.sectionCount}>{missingSpecial.length} faltando</span>
          </div>
          <div className={styles.chips}>
            {missingSpecial.map((id) => (
              <button
                key={id}
                className={`${styles.chip} ${styles.chipSpecial}`}
                onClick={() => setStatus(id, 'owned')}
                title="Clique para marcar como obtida"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {missingByTeam.map(({ team, group, missing }) => (
        <div key={team.code} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionTitle}>{team.name}</span>
              <span className={styles.teamCodeTag}>{team.code}</span>
              <span className={styles.groupTag}>Grupo {group}</span>
            </div>
            <span className={styles.sectionCount}>{missing.length} faltando</span>
          </div>
          <div className={styles.chips}>
            {missing.map((id) => (
              <button
                key={id}
                className={styles.chip}
                onClick={() => setStatus(id, 'owned')}
                title="Clique para marcar como obtida"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
