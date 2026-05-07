import { GROUPS } from '../data/album'
import { useAlbumStore } from '../store/albumStore'
import { Flag } from './Flag'
import styles from './Sidebar.module.css'

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const stickers = useAlbumStore((s) => s.stickers)
  const getStats = useAlbumStore((s) => s.getStats)
  const stats = getStats()

  function getTeamOwned(teamCode: string) {
    let owned = 0
    for (let i = 1; i <= 20; i++) {
      const s = stickers[`${teamCode}${i}`]
      if (s && s.status !== 'missing') owned++
    }
    return owned
  }

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>⚽</div>
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>PANINI</div>
          <div className={styles.logoSub}>Copa do Mundo 2026</div>
        </div>
      </div>

      <div className={styles.globalProgress}>
        <div className={styles.globalProgressHeader}>
          <span className={styles.globalProgressLabel}>Progresso</span>
          <span className={styles.globalProgressPct}>{stats.completion}%</span>
        </div>
        <div className={styles.globalProgressTrack}>
          <div className={styles.globalProgressFill} style={{ width: `${stats.completion}%` }} />
        </div>
        <div className={styles.globalStats}>
          <span className={styles.statGreen}>{stats.owned} tenho</span>
          <span className={styles.statRed}>{stats.missing} faltam</span>
          <span className={styles.statYellow}>{stats.duplicates} rep.</span>
        </div>
      </div>

      <div className={styles.navSection}>
        {[
          { id: 'dashboard', icon: '◈', label: 'Visão Geral' },
          { id: 'special', icon: '★', label: 'Especiais' },
          { id: 'missing', icon: '◻', label: 'Faltando' },
          { id: 'duplicates', icon: '⧉', label: 'Repetidas' },
        ].map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeView === item.id ? styles.navActive : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.divider} />
      <div className={styles.groupsHeader}>GRUPOS</div>

      <div className={styles.groupsList}>
        {GROUPS.map((group) => (
          <div key={group.name} className={styles.groupBlock}>
            <div className={styles.groupLabel}>Grupo {group.name}</div>
            {group.teams.map((team) => {
              const owned = getTeamOwned(team.code)
              const pct = (owned / 20) * 100
              const isActive = activeView === `team-${team.code}`
              return (
                <button
                  key={team.code}
                  className={`${styles.teamBtn} ${isActive ? styles.teamActive : ''}`}
                  onClick={() => onNavigate(`team-${team.code}`)}
                  style={isActive ? { '--team-color': team.color } as React.CSSProperties : undefined}
                >
                  <Flag iso={team.iso} size="sm" />
                  <div className={styles.teamInfo}>
                    <div className={styles.teamName}>{team.code}</div>
                    <div className={styles.teamBar}>
                      <div className={styles.teamBarFill} style={{ width: `${pct}%`, background: team.color }} />
                    </div>
                  </div>
                  <span className={styles.teamCount}>{owned}/20</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}
