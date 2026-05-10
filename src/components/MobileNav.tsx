import { GROUPS } from '../data/album'
import { useAlbumStore } from '../store/albumStore'
import styles from './MobileNav.module.css'

interface MobileNavProps {
  activeView: string
  onNavigate: (view: string) => void
  onExport: () => void
  onBatch: () => void
}

export function MobileNav({ activeView, onNavigate, onExport, onBatch }: MobileNavProps) {
  const getStats = useAlbumStore((s) => s.getStats)
  const stats = getStats()

  const mainItems = [
    { id: 'dashboard', icon: '◈', label: 'Geral' },
    { id: 'missing', icon: '◻', label: 'Faltando' },
    { id: 'duplicates', icon: '⧉', label: 'Repetidas' },
    { id: 'special', icon: '★', label: 'Especiais' },
  ]

  const isTeamView = activeView.startsWith('team-')

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{stats.owned}</span>
          <span className={styles.statLbl}>tenho</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--red)' }}>{stats.missing}</span>
          <span className={styles.statLbl}>faltam</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--yellow)' }}>{stats.duplicates}</span>
          <span className={styles.statLbl}>rep.</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--gold)' }}>{stats.completion}%</span>
          <span className={styles.statLbl}>completo</span>
        </div>
        <button className={styles.batchBtn} onClick={onBatch}>⚡</button>
        <button className={styles.exportBtn} onClick={onExport}>📤</button>
      </div>

      <nav className={styles.nav}>
        {mainItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${activeView === item.id ? styles.navActive : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
        <button
          className={`${styles.navBtn} ${isTeamView ? styles.navActive : ''}`}
          onClick={() => onNavigate('groups')}
        >
          <span className={styles.navIcon}>🏟</span>
          <span className={styles.navLabel}>Grupos</span>
        </button>
      </nav>
    </div>
  )
}
