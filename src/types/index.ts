export interface DataPoint {
  timestamp: number
  value: number
}

export interface WindowStats {
  min: number
  max: number
  avg: number
  p95: number
}

export interface TickPayload {
  cpu: { current: number; history: DataPoint[]; stats: WindowStats }
  memory: { used: number; total: number; percentage: number }
  network: {
    upload: number
    download: number
    history: { upload: DataPoint[]; download: DataPoint[] }
  }
  errors: { total: number; byType: Record<string, number> }
  metrics: { fcp: number; lcp: number }
}

export interface SignedTick {
  payload: TickPayload
  signature: string
  timestamp: number
}

export interface WorkerCommand {
  cmd: 'tick' | 'setWindow' | 'setHighLoad'
  windowSize: number
  highLoad?: boolean
  injectAnomaly?: boolean
}

export interface EventFeedItem {
  id: string
  time: string
  badge: 'ok' | 'warn' | 'err'
  label: string
  message: string
}

export interface MetricDatum {
  label: string
  value: number
  unit: string
  decimals?: number
}

export type RefreshRate = 500 | 1000 | 2000 | 5000
export type WindowSize = 30 | 60 | 120

const VALID_REFRESH_RATES: readonly number[] = [500, 1000, 2000, 5000]
const VALID_WINDOW_SIZES: readonly number[] = [30, 60, 120]

export function isRefreshRate(v: number): v is RefreshRate {
  return VALID_REFRESH_RATES.includes(v)
}

export function isWindowSize(v: number): v is WindowSize {
  return VALID_WINDOW_SIZES.includes(v)
}

export function humanizeRate(ms: RefreshRate): string {
  if (ms >= 1000) return (ms / 1000) + '秒'
  return ms + '毫秒'
}
