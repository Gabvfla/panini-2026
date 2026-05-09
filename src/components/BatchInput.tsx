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
  teamCode?: string
  num?: number
}

const ALL_IDS_SET = new Set(ALL_STICKER_IDS)

function parseInput(raw: string): ParsedToken[] {
  const normalized = raw.toUpperCase().replace(/[,;|\n\t]+/g, ' ').trim()
  const tokens = normalized.split(/\s+/).filter(Boolean)
  const result: ParsedToken[] = []
  const seen = new Set<string>()

  for (const token of tokens) {
    if (seen.has(token)) continue
    seen.add(token)

    if (ALL_IDS_SET.has(token)) {
      const isSpecial = SPECIAL_STICKERS.includes(token)
      if (isSpecial) {
        result.push({ id: token, valid: true })
      } else {
        const match = token.match(/^([A-Z]+)(\d+)$/)
        if (match) {
          result.push({ id: token, valid: true, teamCode: match[1], num: parseInt(match[2]) })
        }
      }
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
          if (ALL_IDS_SET.has(id) && !seen.has(id)) {
            seen.add(id)
            result.push({ id, valid: true, teamCode: code, num: i })
          }
        }
        continue
      }
    }

    result.push({ id: token, valid: false })
  }

  return result
}

export function BatchInput({ onClose }: BatchInputProps) {
  const markAll = useAlbumStore((s) => s.markAll)
  const stickers = useAlbumStore((s) => s.stickers)
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState<StickerStatus>('owned')
  const [applied, setApplied] = useState(false)
  const [appliedCount, setAppliedCount] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const parsed = inputValue.trim() ? parseInput(inputValue) : []
  const valid = parsed.filter((t) => t.valid)
  const invalid = parsed.filter((t) => !t.valid)

  const alreadyOwned = valid.filter((t) => stickers[t.id]?.status === status)
  const toApply = valid.filter((t) => stickers[t.id]?.status !== status)

  const handleApply = useCallback(() => {
    if (toApply.length === 0) return
    markAll(toApply.map((t) => t.id), status)
    setAppliedCount(toApply.length)
    setApplied(true)
    setInputValue('')
    setTimeout(() => setApplied(false), 2500)
  }, [toApply, status, markAll])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleApply()
    }
  }

  const examples = ['BRA1 BRA2 BRA3', 'ARG1-5', 'FWC1 FWC2 00', 'BRA1, ARG3, ESP7']

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚡</div>
            <div>
              <h2 className={styles.title}>Entrada rápida</h2>
              <p className={styles.subtitle}>Digite os códigos das figurinhas separados por espaço</p>
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
                onClick={() => setStatus('owned')}
              >
                ✓ Tenho
              </button>
              <button
                className={`${styles.statusBtn} ${status === 'duplicate' ? styles.statusBtnDup : ''}`}
                onClick={() => setStatus('duplicate')}
              >
                ⧉ Repetida
              </button>
              <button
                className={`${styles.statusBtn} ${status === 'missing' ? styles.statusBtnMissing : ''}`}
                onClick={() => setStatus('missing')}
              >
                ◻ Faltando
              </button>
            </div>
          </div>

          <div className={styles.inputWrap}>
            <textarea
              ref={inputRef}
              className={styles.textarea}
              placeholder="Ex: BRA1 BRA2 ARG1-5 FWC1 ESP3..."
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
            <span className={styles.hintRange}>Use intervalos: <code>BRA1-5</code> marca BRA1 até BRA5</span>
          </div>

          {parsed.length > 0 && (
            <div className={styles.preview}>
              <div className={styles.previewHeader}>
                <span className={styles.previewTitle}>Preview</span>
                <div className={styles.previewCounts}>
                  {valid.length > 0 && <span className={styles.countValid}>{valid.length} reconhecidas</span>}
                  {invalid.length > 0 && <span className={styles.countInvalid}>{invalid.length} inválidas</span>}
                  {alreadyOwned.length > 0 && <span className={styles.countSkip}>{alreadyOwned.length} já {status === 'owned' ? 'tenho' : status === 'duplicate' ? 'repetidas' : 'faltando'}</span>}
                </div>
              </div>

              {valid.length > 0 && (
                <div className={styles.tokenGrid}>
                  {valid.map((t) => {
                    const team = t.teamCode ? TEAM_MAP[t.teamCode] : null
                    const isAlready = stickers[t.id]?.status === status
                    return (
                      <div
                        key={t.id}
                        className={`${styles.token} ${isAlready ? styles.tokenSkip : styles.tokenValid}`}
                      >
                        {team && <Flag iso={team.iso} size="sm" />}
                        {!team && <span className={styles.tokenStar}>★</span>}
                        <span className={styles.tokenId}>{t.id}</span>
                        {isAlready && <span className={styles.tokenCheck}>✓</span>}
                      </div>
                    )
                  })}
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
              ✓ {appliedCount} figurinha{appliedCount !== 1 ? 's' : ''} marcada{appliedCount !== 1 ? 's' : ''}!
            </div>
          )}
          <div className={styles.footerActions}>
            <span className={styles.shortcut}>Ctrl+Enter para aplicar</span>
            <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={toApply.length === 0}
            >
              {toApply.length === 0
                ? 'Nada para aplicar'
                : `Aplicar ${toApply.length} figurinha${toApply.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
