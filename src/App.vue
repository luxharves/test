<script setup lang="ts">
import { computed, onMounted } from 'vue'
import StatusBar from './components/StatusBar.vue'
import ControlButtons from './components/ControlButtons.vue'
import MetricCard from './components/MetricCard.vue'
import EventFeed from './components/EventFeed.vue'
import CpuChart from './components/CpuChart.vue'
import NetworkChart from './components/NetworkChart.vue'
import MemoryGauge from './components/MemoryGauge.vue'
import { useMonitor } from './composables/useMonitor'
import { registerDarkTheme } from './composables/useEChartsTheme'
import { isRefreshRate, isWindowSize, humanizeRate } from './types'

const {
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
  initWorker,
  toggleRunning,
  setRefreshRate,
  setWindowSize,
  toggleHighLoad,
  injectAnomaly,
} = useMonitor()

onMounted(() => {
  registerDarkTheme()
  initWorker()
})

const heroMetrics = computed(() => [
  { label: 'CPU 使用率', value: cpuCurrent.value, unit: '%', decimals: 1 },
  { label: '响应延迟', value: cpuStats.value.avg, unit: 'ms', decimals: 1 },
  { label: '错误率', value: 0.3, unit: '%', decimals: 1 },
  { label: '线程耗时', value: workerActive.value ? 12 : 0, unit: 'ms', decimals: 0 },
])

function onUpdateRate(event: Event) {
  const val = Number((event.target as HTMLSelectElement).value)
  if (isRefreshRate(val)) setRefreshRate(val)
}

function onUpdateWindow(event: Event) {
  const val = Number((event.target as HTMLSelectElement).value)
  if (isWindowSize(val)) setWindowSize(val)
}
</script>

<template>
  <div class="dashboard">
    <!-- Status Bar -->
    <div class="status-bar">
      <StatusBar
        :refresh-rate-ms="humanizeRate(refreshRate)"
        :window-size="windowSize"
        :worker-status="workerActive ? '运行中' : '已停止'"
      >
        <template #controls>
          <ControlButtons
            :running="running"
            :high-load="highLoad"
            @toggle-running="toggleRunning"
            @update-rate="onUpdateRate"
            @update-window="onUpdateWindow"
            @inject-anomaly="injectAnomaly"
            @toggle-highload="toggleHighLoad"
          />
        </template>
      </StatusBar>
    </div>

    <!-- Hero Metrics -->
    <div class="hero-metrics">
      <MetricCard
        v-for="(m, i) in heroMetrics"
        :key="m.label"
        :label="m.label"
        :value="m.value"
        :unit="m.unit"
        :decimals="m.decimals"
        :delay="i * 80"
      />
    </div>

    <!-- Main Chart: CPU Trend -->
    <div class="main-chart monitor-card card-hero">
      <div class="chart-title">CPU 趋势</div>
      <div class="chart-body">
        <CpuChart :history="cpuHistory" :threshold="85" :alert="alertActive" />
      </div>
    </div>

    <!-- Event Feed -->
    <div class="event-feed">
      <EventFeed :items="events" />
    </div>

    <!-- Bottom Grid: Network + Memory -->
    <div class="bottom-left">
      <div class="bottom-chart monitor-card">
        <div class="chart-title">网络吞吐量</div>
        <div class="chart-body">
          <NetworkChart
            :upload-history="uploadHistory"
            :download-history="downloadHistory"
          />
        </div>
      </div>
      <div class="bottom-chart monitor-card">
        <div class="chart-title">内存用量</div>
        <div class="chart-body">
          <MemoryGauge :used="memoryUsed" :total="memoryTotal" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-template-rows: auto auto 1fr auto;
  gap: 16px;
  padding: 24px;
  height: 100vh;
}

.status-bar {
  grid-column: 1 / -1;
}

.hero-metrics {
  grid-column: 1 / -1;
  display: flex;
  gap: 16px;
}

.hero-metrics > * {
  flex: 1;
}

.main-chart {
  grid-column: 1;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.event-feed {
  grid-column: 2;
  grid-row: 3 / 5;
}

.bottom-left {
  grid-column: 1;
  display: flex;
  gap: 16px;
}

.bottom-left > * {
  flex: 1;
}

.bottom-chart {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.chart-body {
  flex: 1;
  min-height: 0;
}
</style>
