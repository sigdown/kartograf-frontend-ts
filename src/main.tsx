import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import { SiteContentProvider } from './content/siteContent'
import App from './app/App'
import { loadRuntimeConfig } from './config/runtimeConfig'

async function bootstrap() {
  await loadRuntimeConfig()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

void bootstrap()
