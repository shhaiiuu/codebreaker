import { useEffect, useState } from 'react'
import { configured, ensureSession } from './lib/supabase'
import { DOODLE } from './lib/doodles'
import CreatePage from './components/CreatePage'
import Home from './components/Home'
import Room from './components/Room'

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-4">
      <div className="card w-full space-y-2 p-5 text-center"><h1 className="text-xl font-bold">{title}</h1><p>{children}</p></div>
    </main>
  )
}

export default function App() {
  const [uid, setUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'home' | 'create'>('home')
  const [code, setCode] = useState<string | null>(() => new URLSearchParams(location.search).get('room')?.toUpperCase() ?? null)

  useEffect(() => {
    if (!configured) return
    ensureSession().then((u) => setUid(u.id)).catch((e) => setError(e.message))
  }, [])

  const go = (c: string | null) => {
    history.replaceState(null, '', c ? `?room=${c}` : location.pathname)
    setView('home')
    setCode(c)
  }

  let page: React.ReactNode
  if (!configured) page = <Message title="Setup needed">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README step 3), then restart.</Message>
  else if (error) page = <Message title="Could not sign in">{error}. Check that anonymous sign-ins are enabled in Supabase (README step 2).</Message>
  else if (!uid) page = <Message title="Connecting…">One moment.</Message>
  else if (code) page = <Room code={code} uid={uid} onLeave={() => go(null)} />
  else if (view === 'create') page = <CreatePage onBack={() => setView('home')} onEnter={go} />
  else page = <Home onCreate={() => setView('create')} onEnter={go} />

  return <div className="min-h-screen" style={{ backgroundColor: code ? '#0b1f63' : '#1a4fd6', backgroundImage: `url("${DOODLE}")`, backgroundSize: '360px 360px' }}>{page}</div>
}
