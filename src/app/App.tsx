import { AppScreens } from './AppScreens'
import { useAppController } from './useAppController'
import '../styles/index.css'

export default function App() {
  const controller = useAppController()

  return <AppScreens controller={controller} />
}