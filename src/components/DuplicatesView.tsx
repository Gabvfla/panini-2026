import { useAlbumStore } from '../store/albumStore'
import { GROUPS, SPECIAL_STICKERS } from '../data/album'
import styles from './DuplicatesView.module.css'

export function DuplicatesView() {
  const stickers = useAlbumStore((s) => s.stickers)
  const setStatus = useAlbumStore((s) => s.setStatus)
  const setDuplicateCount = useAlbumStore((s) => s.setDuplicateCount)

  const dupSpecial = SPECIAL_STICKERS.filter(
    (id) => stickers[id]?.status === 'duplicate'
  )

  const dupByTeam = GROUPS.flatMap((group) =>
    group.teams.map((team) => {
      const dups = Array.from({ length: 20 }, (_, i) => `${team.code}${i + 1}`).filter(
        (id) => stickers[id]?.status === 'duplicate'
      )
      return { team, group: group.name, dups }
    })
  ).filter((t) => t.dups.length > 0)

  const totalDups =
    dupSpecial.length + dupByTeam.reduce((acc, t) => acc + t.dups.length, 0)

  const totalCards = dupSpecial.reduce((acc, id) => acc + (stickers[id]?.duplicateCount ?? 1), 0) +
    dupByTeam.reduce(
      (acc, t) => acc + t.dups.reduce((a, id) => a + (stickers[id]?.duplicateCount ?? 1), 0),
      0
    )

  function handleCountChange(id: string, value: string) {
    const n = parseInt(value)
    if (!isNaN(n) && n >= 1) setDuplicateCount(id, n)
    else if (value === '' || n === 0) setStatus(id, 'owned')
  }

  function renderDupChip(id: string) {
    const count = stickers[id]?.duplicateCount ?? 1
    return (
      <div key={id} className={styles.chip}>
        <span className={styles.chipId}>{id}</span>
        <div className={styles.chipControls}>
          <button
            className={styles.countBtn}
            onClick={() => {
              if (count <= 1) setStatus(id, 'owned')
              else setDuplicateCount(id, count - 1)
            }}
          >
            −
          </button>
          <input
            className={styles.countInput}
            type="number"
            min={1}
            value={count}
            onChange={(e) => handleCountChange(id, e.target.value)}
          />
          <button
            className={styles.countBtn}
            onClick={() => setDuplicateCount(id, count + 1)}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>FIGURINHAS REPETIDAS</h1>
          <p className={styles.subtitle}>
            {totalDups} tipos · {totalCards} cartas no total para trocar
          </p>
        </div>
      </div>

      {totalDups === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔄</div>
          <div className={styles.emptyTitle}>Nenhuma repetida</div>
          <div className={styles.emptyText}>Marque figurinhas como "repetida" nas seleções.</div>
        </div>
      )}

      {dupSpecial.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>★ Especiais</span>
            <span className={styles.sectionCount}>{dupSpecial.length} tipos</span>
          </div>
          <div className={styles.chips}>
            {dupSpecial.map(renderDupChip)}
          </div>
        </div>
      )}

      {dupByTeam.map(({ team, group, dups }) => (
        <div key={team.code} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionTitle}>{team.name}</span>
              <span className={styles.teamCodeTag}>{team.code}</span>
              <span className={styles.groupTag}>Grupo {group}</span>
            </div>
            <span className={styles.sectionCount}>{dups.length} tipos</span>
          </div>
          <div className={styles.chips}>
            {dups.map(renderDupChip)}
          </div>
        </div>
      ))}
    </div>
  )
}
