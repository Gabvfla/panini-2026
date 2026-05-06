import { GROUPS } from '../data/album'
import { useAlbumStore } from '../store/albumStore'
import styles from './Sidebar.module.css'

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const stickers = useAlbumStore((s) => s.stickers)

  function getTeamCompletion(teamCode: string) {
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
        <span className={styles.logoIcon}>⚽</span>
        <div>
          <div className={styles.logoTitle}>PANINI</div>
          <div className={styles.logoSub}>Copa 2026</div>
        </div>
      </div>

      <div className={styles.section}>
        <button
          className={`${styles.navItem} ${activeView === 'dashboard' ? styles.active : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className={styles.navIcon}>◈</span>
          Visão Geral
        </button>
        <button
          className={`${styles.navItem} ${activeView === 'special' ? styles.active : ''}`}
          onClick={() => onNavigate('special')}
        >
          <span className={styles.navIcon}>★</span>
          Especiais
        </button>
        <button
          className={`${styles.navItem} ${activeView === 'missing' ? styles.active : ''}`}
          onClick={() => onNavigate('missing')}
        >
          <span className={styles.navIcon}>◻</span>
          Faltando
        </button>
        <button
          className={`${styles.navItem} ${activeView === 'duplicates' ? styles.active : ''}`}
          onClick={() => onNavigate('duplicates')}
        >
          <span className={styles.navIcon}>⧉</span>
          Repetidas
        </button>
      </div>

      <div className={styles.groupsLabel}>GRUPOS</div>

      <div className={styles.groupsList}>
        {GROUPS.map((group) => (
          <div key={group.name} className={styles.groupItem}>
            <div className={styles.groupHeader}>
              <span className={styles.groupBadge}>G{group.name}</span>
            </div>
            {group.teams.map((team) => {
              const owned = getTeamCompletion(team.code)
              const pct = Math.round((owned / 20) * 100)
              const isActive = activeView === `team-${team.code}`
              return (
                <button
                  key={team.code}
                  className={`${styles.teamItem} ${isActive ? styles.activeTeam : ''}`}
                  onClick={() => onNavigate(`team-${team.code}`)}
                >
                  <span className={styles.teamCode}>{team.code}</span>
                  <div className={styles.teamProgress}>
                    <div
                      className={styles.teamProgressBar}
                      style={{ width: `${pct}%` }}
                    />
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
