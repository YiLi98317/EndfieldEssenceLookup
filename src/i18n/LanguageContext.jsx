import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'language'

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
  } catch (_) {}
  return 'en'
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getStoredLanguage())

  const setLanguage = useCallback((lang) => {
    if (lang !== 'en' && lang !== 'zh') return
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch (_) {}
  }, [])

  const t = useCallback(
    (key, replacements = {}) => {
      const map = translations[language]
      let str = map?.[key] ?? key
      Object.entries(replacements).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
      return str
    },
    [language]
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
