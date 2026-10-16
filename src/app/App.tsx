import { lazy, Suspense } from 'react'

import { useSession } from '@/entities/session'

import { AppProviders } from './providers/AppProviders'

const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })))
const MessengerPage = lazy(() =>
  import('@/pages/messenger').then((m) => ({ default: m.MessengerPage })),
)

export function App() {
  const session = useSession()

  return (
    <AppProviders>
      <Suspense fallback={<div className="h-svh bg-background" />}>
        {session ? <MessengerPage key={session.idInstance} /> : <LoginPage />}
      </Suspense>
    </AppProviders>
  )
}
