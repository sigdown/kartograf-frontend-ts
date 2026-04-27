import { AppScreens } from './AppScreens'
import { useAppController } from './useAppController'
import '../App.css'

export default function App() {
  const controller = useAppController()

  return <AppScreens controller={controller} />
}