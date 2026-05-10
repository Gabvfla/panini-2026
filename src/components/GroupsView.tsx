import { GROUPS } from '../data/album'
import { useAlbumStore } from '../store/albumStore'
import { Flag } from './Flag'
import styles from './GroupsView.module.css'

interface GroupsViewProps {
  onSelectTeam: (code: string) => void
}

export function GroupsView({ onSelectTeam }: GroupsViewProps) {
  const stickers = useAlbumStore((s) => s.stickers)

  function getTeamOwned(teamCode: string) {
    let owned = 0
    for (let i = 1; i <= 20; i++) {
      const s = stickers[`${teamCode}${i}`]
      if (s && s.status !== 'missing') owned++
    }
    return owned
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GRUPOS</h1>
      {GROUPS.map((group) => (
        <div key={group.name} className={styles.group}>
          <div className={styles.groupLabel}>Grupo {group.name}</div>
          <div className={styles.teams}>
            {group.teams.map((team) => {
              const owned = getTeamOwned(team.code)
              const pct = (owned / 20) * 100
              return (
                <button
                  key={team.code}
                  className={styles.teamBtn}
                  onClick={() => onSelectTeam(team.code)}
                >
                  <Flag iso={team.iso} size="md" />
                  <div className={styles.teamInfo}>
                    <div className={styles.teamName}>{team.name}</div>
                    <div className={styles.teamBar}>
                      <div className={styles.teamFill} style={{ width: `${pct}%`, background: team.color }} />
                    </div>
                  </div>
                  <span className={styles.teamCount} style={{ color: team.color }}>{owned}/20</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
