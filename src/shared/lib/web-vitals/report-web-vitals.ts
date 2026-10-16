import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

export type WebVitalsHandler = (metric: Metric) => void

const ratingStyle: Record<Metric['rating'], string> = {
  good: 'color: #3f6b4f',
  'needs-improvement': 'color: #b08a3e',
  poor: 'color: #8c2f2f',
}

export const logMetric: WebVitalsHandler = (metric) => {
  console.info(
    `%c[web-vitals] ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)} (${metric.rating})`,
    ratingStyle[metric.rating],
  )
}

export const createBeaconHandler =
  (endpoint: string): WebVitalsHandler =>
  (metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      page: location.pathname,
    })
    if (!navigator.sendBeacon?.(endpoint, body)) {
      void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => undefined)
    }
  }

export function reportWebVitals(...handlers: WebVitalsHandler[]) {
  const handle: WebVitalsHandler = (metric) => handlers.forEach((handler) => handler(metric))
  onCLS(handle)
  onFCP(handle)
  onINP(handle)
  onLCP(handle)
  onTTFB(handle)
}
