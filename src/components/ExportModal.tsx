import { useState } from 'react'
import { useAlbumStore } from '../store/albumStore'
import {
  generateXlsx,
  generateMissingXlsx,
  generateDuplicatesXlsx,
  generateCSV,
  downloadBlob,
  getTimestampedFilename,
} from '../utils/exportUtils'
import styles from './ExportModal.module.css'

interface ExportModalProps {
  onClose: () => void
}

type ExportFormat = 'xlsx-full' | 'xlsx-missing' | 'xlsx-duplicates' | 'csv-full'

interface ExportOption {
  id: ExportFormat
  icon: string
  title: string
  description: string
  ext: string
  tag: string
  tagColor: string
}

const OPTIONS: ExportOption[] = [
  {
    id: 'xlsx-full',
    icon: '📊',
    title: 'Excel completo (.xlsx)',
    description: 'Todas as 980 figurinhas com status colorido. Abre no Excel, Google Sheets e Numbers.',
    ext: 'xlsx',
    tag: 'Recomendado',
    tagColor: 'green',
  },
  {
    id: 'xlsx-missing',
    icon: '❌',
    title: 'Excel — Faltando (.xlsx)',
    description: 'Somente as figurinhas que faltam. Ideal para levar na hora de comprar pacotes.',
    ext: 'xlsx',
    tag: 'Compacto',
    tagColor: 'red',
  },
  {
    id: 'xlsx-duplicates',
    icon: '🔁',
    title: 'Excel — Repetidas (.xlsx)',
    description: 'Somente as repetidas com quantidade. Perfeito para organizar trocas.',
    ext: 'xlsx',
    tag: 'Trocas',
    tagColor: 'yellow',
  },
  {
    id: 'csv-full',
    icon: '📋',
    title: 'CSV completo',
    description: 'Todas as figurinhas em formato CSV. Compatível com qualquer aplicativo.',
    ext: 'csv',
    tag: 'Universal',
    tagColor: 'blue',
  },
]

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function ExportModal({ onClose }: ExportModalProps) {
  const stickers = useAlbumStore((s) => s.stickers)
  const getStats = useAlbumStore((s) => s.getStats)
  const stats = getStats()
  const [exported, setExported] = useState<Set<ExportFormat>>(new Set())
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  function handleExport(option: ExportOption) {
    setLoading(option.id)
    setTimeout(() => {
      try {
        if (option.id === 'xlsx-full') {
          downloadBlob(generateXlsx(stickers), getTimestampedFilename('panini-2026', 'xlsx'), XLSX_MIME)
        } else if (option.id === 'xlsx-missing') {
          downloadBlob(generateMissingXlsx(stickers), getTimestampedFilename('panini-2026-faltando', 'xlsx'), XLSX_MIME)
        } else if (option.id === 'xlsx-duplicates') {
          downloadBlob(generateDuplicatesXlsx(stickers), getTimestampedFilename('panini-2026-repetidas', 'xlsx'), XLSX_MIME)
        } else if (option.id === 'csv-full') {
          downloadBlob(generateCSV(stickers), getTimestampedFilename('panini-2026', 'csv'), 'text/csv;charset=utf-8')
        }
        setExported((prev) => new Set([...prev, option.id]))
      } finally {
        setLoading(null)
      }
    }, 80)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📤</div>
            <div>
              <h2 className={styles.title}>Exportar álbum</h2>
              <p className={styles.subtitle}>Abra no celular via Google Sheets ou Excel mobile</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--green)' }}>{stats.owned}</span>
            <span className={styles.statLabel}>tenho</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--red)' }}>{stats.missing}</span>
            <span className={styles.statLabel}>faltando</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--yellow)' }}>{stats.duplicates}</span>
            <span className={styles.statLabel}>repetidas</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--gold)' }}>{stats.completion}%</span>
            <span className={styles.statLabel}>completo</span>
          </div>
        </div>

        <div className={styles.options}>
          {OPTIONS.map((option) => {
            const isLoading = loading === option.id
            const isDone = exported.has(option.id)
            return (
              <div key={option.id} className={`${styles.option} ${isDone ? styles.optionDone : ''}`}>
                <div className={styles.optionLeft}>
                  <div className={styles.optionIcon}>{option.icon}</div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTop}>
                      <span className={styles.optionTitle}>{option.title}</span>
                      <span className={`${styles.optionTag} ${styles[`tag_${option.tagColor}`]}`}>
                        {option.tag}
                      </span>
                    </div>
                    <p className={styles.optionDesc}>{option.description}</p>
                  </div>
                </div>
                <button
                  className={`${styles.exportBtn} ${isDone ? styles.exportBtnDone : ''}`}
                  onClick={() => handleExport(option)}
                  disabled={isLoading}
                >
                  {isLoading ? <span className={styles.spinner} /> : isDone ? '✓ Baixado' : `↓ .${option.ext}`}
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerTip}>
            💡 Envie o .xlsx pelo WhatsApp ou Google Drive para abrir no celular
          </span>
        </div>
      </div>
    </div>
  )
}
