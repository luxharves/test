<template>
  <div class="status-bar">
    <span class="brand">像素脉动</span>
    <span class="system-status">
      <span class="status-dot"></span>
      系统运行中
    </span>
    <span class="status-info">
      刷新: {{ refreshRateMs ?? '1s' }}  ·  窗口: {{ windowSize ?? 60 }}  ·  线程: {{ workerStatus ?? '运行中' }}
    </span>
    <div class="status-controls">
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  refreshRateMs?: string
  windowSize?: number
  workerStatus?: string
}>()
</script>

<style scoped>
.status-bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.system-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: breathe 2s ease-in-out infinite;
  margin: 0 8px;
}

.status-info {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: auto;
}

.status-controls {
  margin-left: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
