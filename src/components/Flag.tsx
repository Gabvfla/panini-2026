import styles from './Flag.module.css'

interface FlagProps {
  iso: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3'

export function Flag({ iso, size = 'md', className }: FlagProps) {
  return (
    <img
      src={`${CDN}/${iso}.svg`}
      alt={iso}
      className={`${styles.flag} ${styles[size]} ${className ?? ''}`}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget
        target.style.display = 'none'
        const span = document.createElement('span')
        span.textContent = '🏳'
        span.className = target.className
        target.parentNode?.replaceChild(span, target)
      }}
    />
  )
}
