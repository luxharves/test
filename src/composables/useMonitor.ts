import { ref, onUnmounted, watch } from 'vue'
import type { SignedTick, TickPayload, EventFeedItem, DataPoint, RefreshRate, WindowSize } from '../types'
import { verify } from './useCrypto'

let nextEventId = 1

export function useMonitor() {
  const running = ref(true)
  const highLoad = ref(false)
  const refreshRate = ref<RefreshRate>(1000)
  const windowSize = ref<WindowSize>(60)
  const workerActive = ref(false)

  const cpuHistory = ref<DataPoint[]>([])
  const uploadHistory = ref<DataPoint[]>([])
  const downloadHistory = ref<DataPoint[]>([])
  const cpuCurrent = ref(0)
  const memoryUsed = ref(6.2)
  const memoryTotal = ref(10)
  const cpuStats = ref({ min: 0, max: 0, avg: 0, p95: 0 })
  const events = ref<EventFeedItem[]>([])
  const alertActive = ref(false)

  let worker: Worker | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let alertTimer: ReturnType<typeof setTimeout> | null = null

  function nowTimeStr(): string {
    const d = new Date()
    return d.toTimeString().slice(0, 8)
  }

  function addEvent(badge: 'ok' | 'warn' | 'err', label: string, message: string) {
    events.value.push({
      id: String(nextEventId++),
      time: nowTimeStr(),
      badge,
      label,
      message,
    })
    while (events.value.length > 20) events.value.shift()
  }

  function initWorker() {
    if (worker) return
    worker = new Worker(new URL('../workers/dataWorker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = async (e: MessageEvent<SignedTick>) => {
      const { payload, signature } = e.data

      // Verify integrity hash
      const payloadStr = JSON.stringify(payload)
      const valid = await verify(payloadStr, signature)

      if (!valid) {
        addEvent('err', 'SIG', '签名不匹配 — 数据完整性告警')
        alertActive.value = true
        if (alertTimer) clearTimeout(alertTimer)
        alertTimer = setTimeout(() => {
          alertActive.value = false
        }, 3000)
        // Still apply the tampered data so the charts show the anomaly
      }

      applyPayload(payload)

      // Generate events based on ACTUAL updated data (not stale)
      generateEvents(payload)
    }

    worker.onerror = (err) => {
      console.error('Worker error:', err)
      workerActive.value = false
    }

    workerActive.value = true

    // Send initial config
    worker.postMessage({ cmd: 'setWindow', windowSize: windowSize.value })
    worker.postMessage({ cmd: 'setHighLoad', highLoad: highLoad.value })
  }

  function applyPayload(payload: TickPayload) {
    cpuHistory.value = payload.cpu.history
    cpuCurrent.value = payload.cpu.current
    cpuStats.value = payload.cpu.stats
    uploadHistory.value = payload.network.history.upload
    downloadHistory.value = payload.network.history.download
    memoryUsed.value = payload.memory.used
    memoryTotal.value = payload.memory.total
  }

  function generateEvents(payload: TickPayload) {
    const cpu = payload.cpu.current
    if (cpu > 85) {
      addEvent('warn', 'CPU', `负载尖峰 (${cpu.toFixed(1)}%)`)
    } else if (Math.random() < 0.3) {
      addEvent('ok', 'WRK', `时钟周期完成 (${(10 + Math.random() * 4).toFixed(0)}ms)`)
    }

    if (Math.random() < 0.25) {
      const kb = (200 + Math.random() * 300).toFixed(0)
      addEvent('ok', 'NET', `吞吐量: ${kb} KB/s`)
    }

    if (payload.errors.total > 0) {
      addEvent('err', 'SYS', `异常检测 — ${payload.errors.total} 项完整性错误`)
    } else if (Math.random() < 0.2) {
      addEvent('ok', 'SIG', '签名校验: 通过')
    }
  }

  function tick() {
    if (!worker) return
    worker.postMessage({ cmd: 'tick' })
  }

  function startTicking() {
    stopTicking()
    tick() // immediate first tick
    timer = setInterval(tick, refreshRate.value)
  }

  function stopTicking() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function toggleRunning() {
    running.value = !running.value
  }

  function setRefreshRate(rate: RefreshRate) {
    refreshRate.value = rate
  }

  function setWindowSize(size: WindowSize) {
    windowSize.value = size
    if (worker) {
      worker.postMessage({ cmd: 'setWindow', windowSize: size })
    }
  }

  function toggleHighLoad() {
    highLoad.value = !highLoad.value
    if (worker) {
      worker.postMessage({ cmd: 'setHighLoad', highLoad: highLoad.value })
    }
  }

  function injectAnomaly() {
    if (!worker) return
    // Set the anomaly flag in Worker, then trigger an immediate tick
    // Worker will tamper with payload AFTER signing → signature mismatch
    worker.postMessage({ cmd: 'injectAnomaly' })
    // Force immediate tick so the anomaly is visible right away
    tick()
  }

  // Watch running state
  watch(running, (val) => {
    if (val) {
      startTicking()
    } else {
      stopTicking()
    }
  }, { immediate: true })

  // Watch refresh rate changes
  watch(refreshRate, () => {
    if (running.value) {
      startTicking() // restart with new interval
    }
  })

  // Cleanup
  onUnmounted(() => {
    stopTicking()
    if (alertTimer) clearTimeout(alertTimer)
    worker?.terminate()
    worker = null
  })

  return {
    // State
    running,
    highLoad,
    refreshRate,
    windowSize,
    workerActive,
    cpuHistory,
    uploadHistory,
    downloadHistory,
    cpuCurrent,
    memoryUsed,
    memoryTotal,
    cpuStats,
    events,
    alertActive,
    // Actions
    initWorker,
    toggleRunning,
    setRefreshRate,
    setWindowSize,
    toggleHighLoad,
    injectAnomaly,
  }
}
