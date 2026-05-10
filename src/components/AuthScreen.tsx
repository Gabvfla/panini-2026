import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import styles from './AuthScreen.module.css'

export function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const { login, register, loading, error, clearError } = useAuthStore()

  function handleChange() {
    clearError()
    setConfirmError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tab === 'register') {
      if (password !== confirm) {
        setConfirmError('As senhas não coincidem')
        return
      }
      if (password.length < 6) {
        setConfirmError('A senha precisa ter pelo menos 6 caracteres')
        return
      }
      await register(email, password)
    } else {
      await login(email, password)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚽</span>
          <div>
            <div className={styles.logoTitle}>PANINI</div>
            <div className={styles.logoSub}>Copa do Mundo 2026</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setTab('login'); handleChange() }}
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => { setTab('register'); handleChange() }}
          >
            Criar conta
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); handleChange() }}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleChange() }}
              required
            />
          </div>

          {tab === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Confirmar senha</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); handleChange() }}
                required
              />
            </div>
          )}

          {(error || confirmError) && (
            <div className={styles.error}>
              {confirmError || error}
            </div>
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : tab === 'login' ? (
              'Entrar'
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Seus dados ficam salvos na nuvem e acessíveis de qualquer dispositivo.
        </p>
      </div>
    </div>
  )
}
