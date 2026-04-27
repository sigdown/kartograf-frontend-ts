import { AccountPanel } from '../components/AccountPanel'
import type { AuthSession } from '../types/auth'
import type { PointPayload, RemotePoint } from '../types/points'

type AccountPageProps = {
  session: AuthSession
  points: RemotePoint[]
  isLoadingPoints: boolean
  pointsError: string
  onBack: () => void
  onSessionChange: (session: AuthSession | null) => void
  onViewPoint: (point: RemotePoint) => void
  onUpdatePoint: (point: RemotePoint, payload: PointPayload) => Promise<void>
  onDeletePoint: (point: RemotePoint) => Promise<void>
  onAccountDeleted: () => void
}

export function AccountPage({
  session,
  points,
  isLoadingPoints,
  pointsError,
  onBack,
  onSessionChange,
  onViewPoint,
  onUpdatePoint,
  onDeletePoint,
  onAccountDeleted,
}: AccountPageProps) {
  return (
    <AccountPanel
      key={session.user.id ?? session.token}
      session={session}
      onBack={onBack}
      onSessionChange={onSessionChange}
      points={points}
      isLoadingPoints={isLoadingPoints}
      pointsError={pointsError}
      onViewPoint={onViewPoint}
      onUpdatePoint={onUpdatePoint}
      onDeletePoint={onDeletePoint}
      onAccountDeleted={onAccountDeleted}
    />
  )
}