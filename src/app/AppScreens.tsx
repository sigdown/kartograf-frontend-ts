import { Navigate, Route, Routes } from 'react-router-dom'
import { clearAuthSession } from '../auth/session'
import { AuthDialog } from '../components/AuthDialog'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { AccountPage } from '../pages/AccountPage'
import { AdminPage } from '../pages/AdminPage'
import { HomePage } from '../pages/HomePage'
import { MapWorkspacePage } from '../pages/MapWorkspacePage'
import { StaticPage } from '../pages/StaticPage'
import { routes } from '../screen/routes'
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
    isAuthOpen,
    closeAuthDialog,
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

  return (
    <>
      <Routes>
        <Route
          path={routes.home}
          element={
            <main className="landing-page">
              {header}
              <HomePage
                authSession={authSession}
                isAdmin={isAdmin}
                setScreenMode={setScreenMode}
              />
              <SiteFooter onNavigate={setScreenMode} />
            </main>
          }
        />
        <Route
          path={routes.view}
          element={
            <div className="workspace-screen">
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
                onRequestAuth={() => setScreenMode('auth')}
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
            </div>
          }
        />
        <Route
          path={routes.account}
          element={
            authSession ? (
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
            ) : (
              <Navigate to={routes.home} replace />
            )
          }
        />
        <Route
          path={routes.admin}
          element={
            authSession && isAdmin ? (
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
            ) : (
              <Navigate to={routes.home} replace />
            )
          }
        />
        <Route
          path={routes.about}
          element={
            <main className="landing-page">
              {header}
              <StaticPage pageId="about" onBack={() => setScreenMode('home')} />
              <SiteFooter onNavigate={setScreenMode} />
            </main>
          }
        />
        <Route
          path={routes.sources}
          element={
            <main className="landing-page">
              {header}
              <StaticPage pageId="sources" onBack={() => setScreenMode('home')} />
              <SiteFooter onNavigate={setScreenMode} />
            </main>
          }
        />
        <Route
          path={routes.licenses}
          element={
            <main className="landing-page">
              {header}
              <StaticPage pageId="licenses" onBack={() => setScreenMode('home')} />
              <SiteFooter onNavigate={setScreenMode} />
            </main>
          }
        />
        <Route
          path={routes.feedback}
          element={
            <main className="landing-page">
              {header}
              <StaticPage pageId="feedback" onBack={() => setScreenMode('home')} />
              <SiteFooter onNavigate={setScreenMode} />
            </main>
          }
        />
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
      {isAuthOpen ? (
        <div className="modal-backdrop auth-overlay-backdrop" role="presentation">
          <div className="auth-overlay">
            <AuthDialog
              onCancel={closeAuthDialog}
              onSuccess={(session) => {
                setAuthSession(session)
                closeAuthDialog()
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
