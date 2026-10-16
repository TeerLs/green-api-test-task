import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/shared/i18n'

import { App } from '@/app/App'
import { bindInstanceStores } from '@/app/model/bind-instance-stores'
import { createBeaconHandler, logMetric, reportWebVitals } from '@/shared/lib/web-vitals'

import '@/app/styles/index.css'

bindInstanceStores()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const vitalsEndpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT
reportWebVitals(
  ...[
    import.meta.env.DEV || import.meta.env.VITE_WEB_VITALS_LOG === 'true' ? logMetric : null,
    vitalsEndpoint ? createBeaconHandler(vitalsEndpoint) : null,
  ].filter((handler) => handler !== null),
)
