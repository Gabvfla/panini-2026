import { useState, useRef, useCallback } from 'react'
import { useAlbumStore } from '../store/albumStore'
import { ALL_STICKER_IDS, TEAM_MAP, SPECIAL_STICKERS } from '../data/album'
import { Flag } from './Flag'
import type { StickerStatus } from '../types'
import styles from './BatchInput.module.css'

interface BatchInputProps {
  onClose: () => void
}

interface ParsedToken {
  id: string
  valid: boolean
  count: number
  teamCode?: string
}

const ALL_IDS_SET = new Set(ALL_STICKER_IDS)

function parseInput(raw: string): ParsedToken[] {
  const normalized = raw.toUpperCase().replace(/[,;|\n\t]+/g, ' ').trim()
  const tokens = normalized.split(/\s+/).filter(Boolean)

  const countMap = new Map<string, number>()
  const orderMap = new Map<string, number>()
  const invalidSet = new Set<string>()

  for (const token of tokens) {
    if (ALL_IDS_SET.has(token)) {
      countMap.set(token, (countMap.get(token) ?? 0) + 1)
      if (!orderMap.has(token)) orderMap.set(token, orderMap.size)
      continue
    }

    const rangeMatch = token.match(/^([A-Z]+)(\d+)-(\d+)$/)
    if (rangeMatch) {
      const [, code, startStr, endStr] = rangeMatch
      const start = parseInt(startStr)
      const end = parseInt(endStr)
      if (start <= end && end <= 20) {
        for (let i = start; i <= end; i++) {
          const id = `${code}${i}`
          if (ALL_IDS_SET.has(id)) {
            countMap.set(id, (countMap.get(id) ?? 0) + 1)
            if (!orderMap.has(id)) orderMap.set(id, orderMap.size)
          }
        }
        continue
      }
    }

    if (!invalidSet.has(token)) invalidSet.add(token)
  }

  const result: ParsedToken[] = []

  const sorted = [...countMap.entries()].sort((a, b) => (orderMap.get(a[0]) ?? 0) - (orderMap.get(b[0]) ?? 0))
  for (const [id, count] of sorted) {
    const match = id.match(/^([A-Z]+)\d+$/)
    result.push({ id, valid: true, count, teamCode: match ? match[1] : undefined })
  }

  for (const id of invalidSet) {
    result.push({ id, valid: false, count: 0 })
  }

  return result
}

export function BatchInput({ onClose }: BatchInputProps) {
  const setDuplicateCount = useAlbumStore((s) => s.setDuplicateCount)
  const setStatus = useAlbumStore((s) => s.setStatus)
  const markAll = useAlbumStore((s) => s.markAll)
  const stickers = useAlbumStore((s) => s.stickers)
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus2] = useState<StickerStatus>('owned')
  const [applied, setApplied] = useState(false)
  const [appliedCount, setAppliedCount] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const parsed = inputValue.trim() ? parseInput(inputValue) : []
  const valid = parsed.filter((t) => t.valid)
  const invalid = parsed.filter((t) => !t.valid)

  const withDuplicates = valid.filter((t) => t.count > 1)
  const singles = valid.filter((t) => t.count === 1)

  const handleApply = useCallback(() => {
    if (valid.length === 0) return

    for (const token of valid) {
      if (token.count > 1) {
        const existing = stickers[token.id]?.duplicateCount ?? 0
        const newCount = existing > 0 ? existing + token.count : token.count
        setDuplicateCount(token.id, newCount)
      } else {
        setStatus(token.id, status)
      }
    }

    setAppliedCount(valid.length)
    setApplied(true)
    setInputValue('')
    setTimeout(() => setApplied(false), 2500)
  }, [valid, status, stickers, setDuplicateCount, setStatus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleApply()
  }

  const examples = ['BRA1 BRA2 BRA3', 'ARG1-5', 'MEX13 MEX13', 'BRA1, BRA1, BRA1']

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚡</div>
            <div>
              <h2 className={styles.title}>Entrada rápida</h2>
              <p className={styles.subtitle}>Repita um código para contar repetidas automaticamente</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Marcar como:</span>
            <div className={styles.statusBtns}>
              <button
                className={`${styles.statusBtn} ${status === 'owned' ? styles.statusBtnOwned : ''}`}
                onClick={() => setStatus2('owned')}
              >
                ✓ Tenho
              </button>
              <button
                className={`${styles.statusBtn} ${status === 'duplicate' ? styles.statusBtnDup : ''}`}
                onClick={() => setStatus2('duplicate')}
              >
                ⧉ Repetida
              </button>
              <button
                className={`${styles.statusBtn} ${status === 'missing' ? styles.statusBtnMissing : ''}`}
                onClick={() => setStatus2('missing')}
              >
                ◻ Faltando
              </button>
            </div>
          </div>

          <div className={styles.inputWrap}>
            <textarea
              ref={inputRef}
              className={styles.textarea}
              placeholder="Ex: MEX13 MEX13 BRA1 BRA2 ARG1-5..."
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setApplied(false) }}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={4}
            />
            {inputValue.length === 0 && (
              <div className={styles.examples}>
                {examples.map((ex) => (
                  <button
                    key={ex}
                    className={styles.exampleBtn}
                    onClick={() => { setInputValue(ex); inputRef.current?.focus() }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.hint}>
            <span>Separe por espaço, vírgula ou quebra de linha.</span>
            <span className={styles.hintRange}>
              Repita um código para contar repetidas: <code>MEX13 MEX13</code> → 2 repetidas &nbsp;·&nbsp; Intervalos: <code>BRA1-5</code>
            </span>
          </div>

          {parsed.length > 0 && (
            <div className={styles.preview}>
              <div className={styles.previewHeader}>
                <span className={styles.previewTitle}>Preview</span>
                <div className={styles.previewCounts}>
                  {singles.length > 0 && <span className={styles.countValid}>{singles.length} figurinha{singles.length !== 1 ? 's' : ''}</span>}
                  {withDuplicates.length > 0 && <span className={styles.countDup}>⧉ {withDuplicates.length} com repetidas</span>}
                  {invalid.length > 0 && <span className={styles.countInvalid}>{invalid.length} inválida{invalid.length !== 1 ? 's' : ''}</span>}
                </div>
              </div>

              {valid.length > 0 && (
                <div className={styles.tokenGrid}>
                  {valid.map((t) => {
                    const isSpecial = SPECIAL_STICKERS.includes(t.id)
                    const team = !isSpecial && t.teamCode ? TEAM_MAP[t.teamCode] : null
                    const isDup = t.count > 1
                    return (
                      <div
                        key={t.id}
                        className={`${styles.token} ${isDup ? styles.tokenDup : styles.tokenValid}`}
                      >
                        {team && <Flag iso={team.iso} size="sm" />}
                        {!team && <span className={styles.tokenStar}>★</span>}
                        <span className={styles.tokenId}>{t.id}</span>
                        {isDup && <span className={styles.tokenBadge}>×{t.count}</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              {withDuplicates.length > 0 && (
                <div className={styles.dupNote}>
                  ⧉ Figurinhas repetidas {withDuplicates.length > 0 ? 'serão marcadas como repetida com a quantidade somada à existente' : ''}
                </div>
              )}

              {invalid.length > 0 && (
                <div className={styles.invalidRow}>
                  <span className={styles.invalidLabel}>Não reconhecidas:</span>
                  {invalid.map((t) => (
                    <span key={t.id} className={styles.tokenInvalid}>{t.id}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {applied && (
            <div className={styles.successMsg}>
              ✓ {appliedCount} figurinha{appliedCount !== 1 ? 's' : ''} aplicada{appliedCount !== 1 ? 's' : ''}!
            </div>
          )}
          <div className={styles.footerActions}>
            <span className={styles.shortcut}>Ctrl+Enter para aplicar</span>
            <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={valid.length === 0}
            >
              {valid.length === 0
                ? 'Nada para aplicar'
                : `Aplicar ${valid.length} figurinha${valid.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
