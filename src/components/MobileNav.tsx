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
  const saveAll = useAlbumStore((s) => s.saveAll)
  const saving = useAlbumStore((s) => s.saving)
  const unsaved = useAlbumStore((s) => s.unsaved)
  const stats = getStats()

  const isTeamView = activeView.startsWith('team-')

  const navItems = [
    { id: 'dashboard', icon: '◈', label: 'Geral' },
    { id: 'missing', icon: '◻', label: 'Faltando' },
    { id: 'duplicates', icon: '⧉', label: 'Repetidas' },
    { id: 'special', icon: '★', label: 'Especiais' },
    { id: 'groups', icon: '🏟', label: 'Grupos' },
  ]

  return (
    <div className={styles.wrapper}>

      {unsaved && (
        <button
          className={styles.saveBanner}
          onClick={saveAll}
          disabled={saving}
        >
          {saving ? (
            <><span className={styles.spinner} /> Salvando...</>
          ) : (
            <>💾 Salvar alterações no álbum</>
          )}
        </button>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{stats.owned}</span>
          <span className={styles.statLbl}>tenho</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--red)' }}>{stats.missing}</span>
          <span className={styles.statLbl}>faltam</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--yellow)' }}>{stats.duplicates}</span>
          <span className={styles.statLbl}>rep.</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--gold)' }}>{stats.completion}%</span>
          <span className={styles.statLbl}>completo</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = item.id === 'groups' ? isTeamView || activeView === 'groups' : activeView === item.id
          return (
            <button
              key={item.id}
              className={`${styles.navBtn} ${isActive ? styles.navActive : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          )
        })}
        <button className={styles.navBtn} onClick={onBatch}>
          <span className={styles.navIcon}>⚡</span>
          <span className={styles.navLabel}>Lote</span>
        </button>
        <button className={styles.navBtn} onClick={onExport}>
          <span className={styles.navIcon}>📤</span>
          <span className={styles.navLabel}>Export</span>
        </button>
      </nav>
    </div>
  )
}
