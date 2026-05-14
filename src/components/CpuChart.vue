<template>
  <div
    ref="containerRef"
    class="cpu-chart"
    :class="{ 'card-alert': alert }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(
  defineProps<{
    history: { timestamp: number; value: number }[]
    threshold?: number
    alert?: boolean
  }>(),
  {
    threshold: 85,
    alert: false,
  },
)

const containerRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'time',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.06)' },
      },
    },
    series: [
      {
        type: 'line',
        data: props.history.map((d) => [d.timestamp, d.value]),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#4fd1ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79,209,255,0.25)' },
              { offset: 1, color: 'rgba(79,209,255,0.01)' },
            ],
          },
        } as any,
        emphasis: {
          lineStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(79,209,255,0.5)',
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            color: '#ff6b6b',
            width: 1,
            opacity: 0.6,
          },
          label: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
          },
          data: [
            { yAxis: props.threshold, name: props.threshold + '%' },
          ],
        },
      },
    ],
  }
}

function onResize() {
  chartInstance?.resize()
}

onMounted(() => {
  if (!containerRef.value) return

  chartInstance = echarts.init(containerRef.value, 'pixel-dark')
  chartInstance.setOption(buildOption())

  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => props.history,
  () => {
    if (chartInstance) {
      chartInstance.setOption(buildOption())
    }
  },
  { deep: true },
)
</script>

<style scoped>
.cpu-chart {
  width: 100%;
  height: 100%;
}
</style>
