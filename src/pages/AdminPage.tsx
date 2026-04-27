import { AdminPanel } from '../components/AdminPanel'
import type { AuthSession } from '../types/auth'

type AdminPageProps = {
  session: AuthSession
  onClose: () => void
  onMapsChanged: (preferredSlug?: string) => void
}

export function AdminPage({
  session,
  onClose,
  onMapsChanged,
}: AdminPageProps) {
  return (
    <AdminPanel
      session={session}
      onClose={onClose}
      onMapsChanged={onMapsChanged}
    />
  )
}