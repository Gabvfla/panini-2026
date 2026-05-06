import { useAlbumStore } from '../store/albumStore'
import { GROUPS } from '../data/album'
import styles from './Dashboard.module.css'

export function Dashboard() {
  const stickers = useAlbumStore((s) => s.stickers)
  const getStats = useAlbumStore((s) => s.getStats)
  const stats = getStats()

  function getGroupStats(groupName: string) {
    const group = GROUPS.find((g) => g.name === groupName)
    if (!group) return { owned: 0, total: 0 }
    let owned = 0
    const total = group.teams.length * 20
    for (const team of group.teams) {
      for (let i = 1; i <= 20; i++) {
        const s = stickers[`${team.code}${i}`]
        if (s && s.status !== 'missing') owned++
      }
    }
    return { owned, total }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ÁLBUM COPA DO MUNDO 2026</h1>
        <p className={styles.subtitle}>Panini — Edição Oficial</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <div className={styles.statLabel}>Total de Figurinhas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: 'var(--green)' }}>
            {stats.owned}
          </div>
          <div className={styles.statLabel}>Tenho</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: 'var(--red)' }}>
            {stats.missing}
          </div>
          <div className={styles.statLabel}>Faltando</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: 'var(--yellow)' }}>
            {stats.duplicates}
          </div>
          <div className={styles.statLabel}>Repetidas</div>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Progresso Geral</span>
          <span className={styles.progressPct}>{stats.completion}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${stats.completion}%` }}
          />
        </div>
      </div>

      <div className={styles.groupsSection}>
        <h2 className={styles.sectionTitle}>Por Grupo</h2>
        <div className={styles.groupsGrid}>
          {GROUPS.map((group) => {
            const { owned, total } = getGroupStats(group.name)
            const pct = Math.round((owned / total) * 100)
            return (
              <div key={group.name} className={styles.groupCard}>
                <div className={styles.groupCardHeader}>
                  <span className={styles.groupCardLabel}>Grupo {group.name}</span>
                  <span className={styles.groupCardCount}>{owned}/{total}</span>
                </div>
                <div className={styles.groupCardBar}>
                  <div className={styles.groupCardFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.groupTeams}>
                  {group.teams.map((t) => (
                    <span key={t.code} className={styles.groupTeamCode}>{t.code}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
