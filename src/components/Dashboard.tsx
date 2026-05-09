import { useAlbumStore } from '../store/albumStore'
import { GROUPS } from '../data/album'
import { Flag } from './Flag'
import styles from './Dashboard.module.css'

interface DashboardProps { onExport: () => void }
export function Dashboard({ onExport }: DashboardProps) {
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
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>⚽ Panini — Edição Oficial</div>
          <h1 className={styles.heroTitle}>COPA DO MUNDO</h1>
          <h1 className={styles.heroTitle2}>2026</h1>
          <p className={styles.heroSub}>Controle sua coleção de figurinhas</p>
          <button className={styles.exportBtn} onClick={onExport}>📤 Exportar álbum</button>
        </div>
        <div className={styles.heroRing}>
          <svg viewBox="0 0 120 120" className={styles.ringsvg}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#ringGrad)" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - stats.completion / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <text x="60" y="56" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontFamily="Bebas Neue" letterSpacing="1">{stats.completion}%</text>
            <text x="60" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="Inter">COMPLETO</text>
          </svg>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statNum}>{stats.total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`${styles.statCard} ${styles.statOwned}`}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statNum}>{stats.owned}</div>
          <div className={styles.statLabel}>Tenho</div>
        </div>
        <div className={`${styles.statCard} ${styles.statMissing}`}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statNum}>{stats.missing}</div>
          <div className={styles.statLabel}>Faltando</div>
        </div>
        <div className={`${styles.statCard} ${styles.statDup}`}>
          <div className={styles.statIcon}>🔁</div>
          <div className={styles.statNum}>{stats.duplicates}</div>
          <div className={styles.statLabel}>Repetidas</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon}>🏟️</span>
          Grupos
        </h2>
        <div className={styles.groupsGrid}>
          {GROUPS.map((group) => {
            const { owned, total } = getGroupStats(group.name)
            const pct = Math.round((owned / total) * 100)
            return (
              <div key={group.name} className={styles.groupCard}>
                <div className={styles.groupCardTop}>
                  <div className={styles.groupCardBadge}>G{group.name}</div>
                  <div className={styles.groupCardFlags}>
                    {group.teams.map((t) => (
                      <Flag key={t.code} iso={t.iso} size="sm" />
                    ))}
                  </div>
                </div>
                <div className={styles.groupCardBar}>
                  <div className={styles.groupCardFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.groupCardFooter}>
                  <div className={styles.groupCardTeams}>
                    {group.teams.map((t) => (
                      <span key={t.code} className={styles.groupTeamCode}>{t.code}</span>
                    ))}
                  </div>
                  <span className={styles.groupCardCount}>{owned}/{total}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
