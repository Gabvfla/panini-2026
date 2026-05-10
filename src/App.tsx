import { useEffect, useState } from 'react'
import { useAlbumStore } from './store/albumStore'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { Dashboard } from './components/Dashboard'
import { TeamView } from './components/TeamView'
import { SpecialView } from './components/SpecialView'
import { MissingView } from './components/MissingView'
import { DuplicatesView } from './components/DuplicatesView'
import { GroupsView } from './components/GroupsView'
import { ExportModal } from './components/ExportModal'
import { BatchInput } from './components/BatchInput'
import styles from './App.module.css'

export default function App() {
  const load = useAlbumStore((s) => s.load)
  const loaded = useAlbumStore((s) => s.loaded)
  const [activeView, setActiveView] = useState('dashboard')
  const [showExport, setShowExport] = useState(false)
  const [showBatch, setShowBatch] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  if (!loaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingIcon}>⚽</div>
        <div className={styles.loadingText}>Carregando álbum...</div>
      </div>
    )
  }

  function renderContent() {
    if (activeView === 'dashboard') return <Dashboard onExport={() => setShowExport(true)} />
    if (activeView === 'special') return <SpecialView />
    if (activeView === 'missing') return <MissingView />
    if (activeView === 'duplicates') return <DuplicatesView />
    if (activeView === 'groups') return <GroupsView onSelectTeam={(code) => setActiveView(`team-${code}`)} />
    if (activeView.startsWith('team-')) {
      return <TeamView teamCode={activeView.replace('team-', '')} />
    }
    return <Dashboard onExport={() => setShowExport(true)} />
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onExport={() => setShowExport(true)}
        onBatch={() => setShowBatch(true)}
      />
      <main className={styles.main}>
        <div className={styles.content}>{renderContent()}</div>
      </main>
      <MobileNav
        activeView={activeView}
        onNavigate={setActiveView}
        onExport={() => setShowExport(true)}
        onBatch={() => setShowBatch(true)}
      />
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showBatch && <BatchInput onClose={() => setShowBatch(false)} />}
    </div>
  )
}
