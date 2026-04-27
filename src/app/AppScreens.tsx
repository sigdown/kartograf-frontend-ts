import { clearAuthSession } from '../auth/session'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { isStaticPageId } from '../screen/screenMode'
import { AccountPage } from '../pages/AccountPage'
import { AdminPage } from '../pages/AdminPage'
import { HomePage } from '../pages/HomePage'
import { MapWorkspacePage } from '../pages/MapWorkspacePage'
import { StaticPage } from '../pages/StaticPage'
import type { PointPayload, RemotePoint } from '../types/points'
import type { AppController } from './useAppController'

type AppScreensProps = {
  controller: AppController
}

export function AppScreens({ controller }: AppScreensProps) {
  const {
    authSession,
    setAuthSession,
    workspace,
    setWorkspace,
    effectiveScreenMode,
    setScreenMode,
    isAdmin,
    maps,
    filteredMaps,
    selectedMap,
    selectedMapTitle,
    selectedMapDescription,
    isLoadingMaps,
    mapsError,
    downloadError,
    downloadingMapKey,
    points,
    isLoadingPoints,
    pointsError,
    isPointsPanelOpen,
    setIsPointsPanelOpen,
    pointContextMenu,
    setPointContextMenu,
    activePoint,
    activePointId,
    setActivePointId,
    pointFocusRequest,
    setPointFocusRequest,
    pointFormState,
    setPointFormState,
    isSubmittingPoint,
    handleLogout,
    refreshMaps,
    requestPointFocus,
    getPointKey,
    buildPointPayload,
    handleCatalogCardClick,
    handleDownloadMap,
    handleCreatePoint,
    handleUpdatePoint,
    handleDeletePoint,
    handleViewportChange,
  } = controller

  const header = (
    <SiteHeader
      authSession={authSession}
      isAdmin={isAdmin}
      onNavigate={setScreenMode}
      onLogout={handleLogout}
    />
  )

  if (effectiveScreenMode === 'account' && authSession) {
    return (
      <>
        {header}
        <AccountPage
          session={authSession}
          onBack={() => setScreenMode('home')}
          onSessionChange={setAuthSession}
          points={points}
          isLoadingPoints={isLoadingPoints}
          pointsError={pointsError}
          onViewPoint={(point: RemotePoint) => {
            requestPointFocus(getPointKey(point))
            setActivePointId(null)
            setScreenMode('guest-map')
          }}
          onUpdatePoint={(point: RemotePoint, payload: PointPayload) => {
            const pointId = point.id ?? getPointKey(point)
            return handleUpdatePoint(pointId, payload)
          }}
          onDeletePoint={handleDeletePoint}
          onAccountDeleted={() => {
            clearAuthSession()
            setAuthSession(null)
            setScreenMode('home')
          }}
        />
      </>
    )
  }

  if (effectiveScreenMode === 'admin' && authSession && isAdmin) {
    return (
      <>
        {header}
        <AdminPage
          session={authSession}
          onClose={() => setScreenMode('home')}
          onMapsChanged={(preferredSlug) => {
            void refreshMaps(preferredSlug)
          }}
        />
      </>
    )
  }

  if (effectiveScreenMode === 'guest-map') {
    return (
      <>
        {header}
        <MapWorkspacePage
          authSession={authSession}
          workspace={workspace}
          setWorkspace={setWorkspace}
          selectedMap={selectedMap}
          selectedMapTitle={selectedMapTitle}
          selectedMapDescription={selectedMapDescription}
          maps={maps}
          filteredMaps={filteredMaps}
          isLoadingMaps={isLoadingMaps}
          mapsError={mapsError}
          downloadError={downloadError}
          downloadingMapKey={downloadingMapKey}
          points={points}
          isLoadingPoints={isLoadingPoints}
          pointsError={pointsError}
          isPointsPanelOpen={isPointsPanelOpen}
          setIsPointsPanelOpen={setIsPointsPanelOpen}
          pointContextMenu={pointContextMenu}
          setPointContextMenu={setPointContextMenu}
          activePoint={activePoint}
          activePointId={activePointId}
          setActivePointId={setActivePointId}
          pointFocusRequest={pointFocusRequest}
          pointFormState={pointFormState}
          setPointFormState={setPointFormState}
          isSubmittingPoint={isSubmittingPoint}
          onBackToHome={() => setScreenMode('home')}
          onViewportChange={handleViewportChange}
          onPointFocusHandled={() => setPointFocusRequest(null)}
          requestPointFocus={requestPointFocus}
          getPointKey={getPointKey}
          buildPointPayload={buildPointPayload}
          handleCatalogCardClick={handleCatalogCardClick}
          handleDownloadMap={handleDownloadMap}
          handleCreatePoint={handleCreatePoint}
          handleUpdatePoint={handleUpdatePoint}
          handleDeletePoint={handleDeletePoint}
        />
      </>
    )
  }

  if (isStaticPageId(effectiveScreenMode)) {
    return (
      <main className="landing-page">
        {header}
        <StaticPage pageId={effectiveScreenMode} onBack={() => setScreenMode('home')} />
        <SiteFooter onNavigate={setScreenMode} />
      </main>
    )
  }

  return (
    <main className="landing-page">
      {header}
      <HomePage
        authSession={authSession}
        isAdmin={isAdmin}
        isAuthOpen={effectiveScreenMode === 'auth'}
        setScreenMode={setScreenMode}
        onAuthSuccess={(session) => {
          setAuthSession(session)
          setScreenMode('home')
        }}
      />
      <SiteFooter onNavigate={setScreenMode} />
    </main>
  )
}