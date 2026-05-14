<template>
  <div ref="chartRef" class="memory-gauge"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  used: number
  total: number
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function buildOption(): echarts.EChartsOption {
  const remaining = Math.max(0, props.total - props.used)
  const used = Math.max(0, props.used)

  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        label: { show: false },
        emphasis: { scale: false },
        itemStyle: { borderColor: 'transparent', borderWidth: 0 },
        data: [
          { value: used, itemStyle: { color: '#a78bfa' } },
          { value: remaining, itemStyle: { color: 'rgba(255,255,255,0.06)' } },
        ],
      },
    ],
    graphic: {
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: `${used.toFixed(1)} / ${props.total} GB`,
        textAlign: 'center' as const,
        fill: 'rgba(255,255,255,0.87)',
        fontSize: 14,
        fontWeight: 550 as const,
        fontFamily: 'Inter',
      },
    } as any,
  }
}

function updateChart() {
  if (!chartInstance) return
  chartInstance.setOption(buildOption())
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, 'pixel-dark')
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => [props.used, props.total],
  () => updateChart(),
)
</script>

<style scoped>
.memory-gauge {
  width: 100%;
  height: 100%;
}
</style>
