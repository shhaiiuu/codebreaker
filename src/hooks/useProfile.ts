import { useEffect, useState } from 'react'

const get = (k: string, d: string) => { try { return localStorage.getItem(k) ?? d } catch { return d } }

/** Name, avatar and language the player picked. Kept in this browser so it survives route changes and refreshes. */
export function useProfile() {
  const [name, setName] = useState(() => get('cb_name', ''))
  const [avatar, setAvatar] = useState(() => Math.min(11, Math.max(0, Number(get('cb_avatar', '0')) || 0)))
  const [lang, setLang] = useState(() => get('cb_lang', 'en'))
  useEffect(() => {
    try { localStorage.setItem('cb_name', name); localStorage.setItem('cb_avatar', String(avatar)); localStorage.setItem('cb_lang', lang) } catch { /* private mode */ }
  }, [name, avatar, lang])
  return { name, setName, avatar, setAvatar, lang, setLang }
}
