<template>
  <div
    class="metric-card monitor-card metric-card-enter"
    :style="{ animationDelay: delay + 'ms' }"
  >
    <span class="metric-label">{{ label }}</span>
    <span class="metric-value">{{ formattedValue }}</span>
    <span class="metric-unit">{{ unit }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    unit: string
    decimals?: number
    delay?: number
  }>(),
  {
    decimals: 1,
    delay: 0,
  },
)

const formattedValue = computed(() => {
  if (!isFinite(props.value)) return '—'
  return props.value.toFixed(props.decimals ?? 1)
})
</script>

<style scoped>
.metric-label {
  display: block;
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.metric-value {
  font-size: 36px;
  font-weight: 550;
  color: var(--text-primary);
  font-feature-settings: 'tnum';
  transition: color 0.4s ease;
}

.metric-unit {
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: 4px;
}
</style>
