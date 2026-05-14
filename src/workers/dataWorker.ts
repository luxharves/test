// Pixel-Pulse Data Worker
// Runs in a separate thread: data generation + sliding window + aggregation + SHA-256 hashing

// Types duplicated from ../types for Worker module isolation
// (Workers run in a separate scope and cannot import TS modules directly)

interface DataPoint {
  timestamp: number
  value: number
}

interface WindowStats {
  min: number
  max: number
  avg: number
  p95: number
}

interface TickPayload {
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

interface SignedTick {
  payload: TickPayload
  signature: string
  timestamp: number
}

// Sliding window state
const cpuWindow: DataPoint[] = []
const uploadWindow: DataPoint[] = []
const downloadWindow: DataPoint[] = []
let windowSize = 60
let highLoad = false
let injectAnomaly = false

// Base values for sine wave simulation
const CPU_BASE = 55
const CPU_AMPLITUDE = 25
const UPLOAD_BASE = 250
const UPLOAD_AMPLITUDE = 100
const DOWNLOAD_BASE = 160
const DOWNLOAD_AMPLITUDE = 80

function computeStats(data: number[]): WindowStats {
  if (data.length === 0) return { min: 0, max: 0, avg: 0, p95: 0 }
  const sorted = [...data].sort((a, b) => a - b)
  const p95Idx = Math.floor(sorted.length * 0.95)
  return {
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    avg: sorted.reduce((s, v) => s + v, 0) / sorted.length,
    p95: sorted[p95Idx]!,
  }
}

function generateSine(now: number, base: number, amplitude: number): number {
  const phase = (now % 60000) / 60000 * Math.PI * 2
  const noise = (Math.random() - 0.5) * amplitude * 0.3
  return base + Math.sin(phase) * amplitude + noise
}

function pushWindow(window: DataPoint[], point: DataPoint, max: number) {
  window.push(point)
  while (window.length > max) window.shift()
}

function generateData(now: number): TickPayload {
  const count = highLoad ? 10 : 1

  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * 1000
    pushWindow(cpuWindow, { timestamp: t, value: generateSine(t, CPU_BASE, CPU_AMPLITUDE) }, windowSize)
    pushWindow(uploadWindow, { timestamp: t, value: generateSine(t, UPLOAD_BASE, UPLOAD_AMPLITUDE) }, windowSize)
    pushWindow(downloadWindow, { timestamp: t, value: generateSine(t, DOWNLOAD_BASE, DOWNLOAD_AMPLITUDE) }, windowSize)
  }

  const cpuValues = cpuWindow.map(d => d.value)
  const memUsed = 4.5 + Math.random() * 3.5

  return {
    cpu: {
      current: cpuValues[cpuValues.length - 1]!,
      history: [...cpuWindow],
      stats: computeStats(cpuValues),
    },
    memory: {
      used: memUsed,
      total: 10,
      percentage: (memUsed / 10) * 100,
    },
    network: {
      upload: uploadWindow[uploadWindow.length - 1]!.value,
      download: downloadWindow[downloadWindow.length - 1]!.value,
      history: {
        upload: [...uploadWindow],
        download: [...downloadWindow],
      },
    },
    errors: {
      total: 0,
      byType: {},
    },
    metrics: {
      fcp: 120 + Math.random() * 30,
      lcp: 450 + Math.random() * 100,
    },
  }
}

async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleTick(): Promise<SignedTick> {
  const now = Date.now()
  const payload = generateData(now)

  const payloadStr = JSON.stringify(payload)
  const signature = await signPayload(payloadStr)

  // Anomaly injection: tamper with payload AFTER signing
  // so the signature no longer matches
  if (injectAnomaly) {
    payload.cpu.current = 999
    payload.cpu.stats.max = 999
    payload.errors.total = 1
    payload.errors.byType = { anomaly: 1 }
    injectAnomaly = false
  }

  return { payload, signature, timestamp: now }
}

// Listen for commands from main thread
self.onmessage = async (e: MessageEvent<{ cmd: string; windowSize?: number; highLoad?: boolean; injectAnomaly?: boolean }>) => {
  const { cmd } = e.data

  switch (cmd) {
    case 'tick': {
      const result = await handleTick()
      self.postMessage(result)
      break
    }
    case 'setWindow': {
      windowSize = e.data.windowSize ?? 60
      break
    }
    case 'setHighLoad': {
      highLoad = e.data.highLoad ?? false
      break
    }
    case 'injectAnomaly': {
      injectAnomaly = true
      break
    }
    default:
      break
  }
}
