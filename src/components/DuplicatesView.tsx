import { useAlbumStore } from '../store/albumStore'
import { GROUPS, SPECIAL_STICKERS } from '../data/album'
import { Flag } from './Flag'
import { useToken } from '../hooks/useToken'
import styles from './DuplicatesView.module.css'

export function DuplicatesView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const token = useToken()
  const setStatus = useAlbumStore((s) => s.setStatus)
  const setDuplicateCount = useAlbumStore((s) => s.setDuplicateCount)

  const dupSpecial = SPECIAL_STICKERS.filter((id) => stickers[id]?.status === 'duplicate')

  const dupByTeam = GROUPS.flatMap((group) =>
    group.teams.map((team) => {
      const dups = Array.from({ length: 20 }, (_, i) => `${team.code}${i + 1}`).filter(
        (id) => stickers[id]?.status === 'duplicate'
      )
      return { team, group: group.name, dups }
    })
  ).filter((t) => t.dups.length > 0)

  const totalTypes = dupSpecial.length + dupByTeam.reduce((acc, t) => acc + t.dups.length, 0)
  const totalCards =
    dupSpecial.reduce((acc, id) => acc + (stickers[id]?.duplicateCount ?? 1), 0) +
    dupByTeam.reduce((acc, t) => acc + t.dups.reduce((a, id) => a + (stickers[id]?.duplicateCount ?? 1), 0), 0)

  function adjust(id: string, delta: number) {
    const current = stickers[id]?.duplicateCount ?? 1
    const next = current + delta
    if (next <= 0) setStatus(id, 'owned', token ?? undefined)
    else setDuplicateCount(id, next, token ?? undefined)
  }

  function renderChip(id: string) {
    const count = stickers[id]?.duplicateCount ?? 1
    return (
      <div key={id} className={styles.chip}>
        <div className={styles.chipId}>{id}</div>
        <div className={styles.chipControls}>
          <button className={styles.cBtn} onClick={() => adjust(id, -1)}>−</button>
          <span className={styles.cCount}>{count}</span>
          <button className={styles.cBtn} onClick={() => adjust(id, +1)}>+</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>🔁</div>
        <div>
          <h1 className={styles.title}>REPETIDAS</h1>
          <p className={styles.subtitle}>
            {totalTypes === 0 ? 'Nenhuma repetida ainda' : `${totalTypes} tipos · ${totalCards} cartas para troca`}
          </p>
        </div>
      </div>

      {totalTypes === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔄</div>
          <div className={styles.emptyTitle}>SEM REPETIDAS</div>
          <div className={styles.emptyText}>Marque figurinhas como "repetida" nas seleções.</div>
        </div>
      )}

      {dupSpecial.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <span className={styles.sectionIcon}>★</span>
              <span className={styles.sectionTitle}>Especiais</span>
            </div>
            <span className={styles.sectionBadge}>{dupSpecial.length} tipos</span>
          </div>
          <div className={styles.chips}>{dupSpecial.map((id) => renderChip(id))}</div>
        </div>
      )}

      {dupByTeam.map(({ team, dups }) => (
        <div key={team.code} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <Flag iso={team.iso} size="sm" />
              <span className={styles.sectionTitle}>{team.name}</span>
              <span className={styles.sectionCode} style={{ color: team.color }}>{team.code}</span>
            </div>
            <span className={styles.sectionBadge}>{dups.length} tipos</span>
          </div>
          <div className={styles.chips}>{dups.map((id) => renderChip(id))}</div>
        </div>
      ))}
    </div>
  )
}
