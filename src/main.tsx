import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import { SiteContentProvider } from './content/siteContent'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SiteContentProvider>
        <App />
      </SiteContentProvider>
    </BrowserRouter>
  </StrictMode>,
)
