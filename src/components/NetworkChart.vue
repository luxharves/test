<template>
  <div ref="containerRef" class="network-chart" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  uploadHistory: { timestamp: number; value: number }[]
  downloadHistory: { timestamp: number; value: number }[]
}>()

const containerRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let handleResize: (() => void) | null = null

function buildOption(
  upload: { timestamp: number; value: number }[],
  download: { timestamp: number; value: number }[],
): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { left: 40, right: 12, top: 28, bottom: 8 },
    xAxis: {
      type: 'time',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.06)' },
      },
    },
    legend: {
      show: true,
      top: 0,
      textStyle: { color: 'rgba(255,255,255,0.45)', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 2,
    },
    series: [
      {
        name: '上传',
        type: 'line',
        data: upload.map((d) => [d.timestamp, d.value]),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#4fd1ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79,209,255,0.12)' },
              { offset: 1, color: 'rgba(79,209,255,0.0)' },
            ],
          } as any,
        },
      },
      {
        name: '下载',
        type: 'line',
        data: download.map((d) => [d.timestamp, d.value]),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.5,
          color: 'rgba(79,209,255,0.35)',
          type: 'dashed',
        },
      },
    ],
  }
}

function updateChart() {
  if (!chart) return
  const option = buildOption(
    props.uploadHistory,
    props.downloadHistory,
  )
  chart.setOption(option)
}

onMounted(() => {
  if (!containerRef.value) return
  chart = echarts.init(containerRef.value, 'pixel-dark')
  updateChart()

  handleResize = () => chart?.resize()
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.uploadHistory,
  () => updateChart(),
  { deep: true },
)
watch(
  () => props.downloadHistory,
  () => updateChart(),
  { deep: true },
)

onUnmounted(() => {
  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.network-chart {
  width: 100%;
  height: 100%;
}
</style>
