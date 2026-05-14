<template>
  <div class="control-buttons">
    <button @click="$emit('toggleRunning')" class="ctrl-btn">
      {{ running ? '⏸' : '▶' }}
    </button>
    <select @change="$emit('updateRate', $event)" class="ctrl-select">
      <option :value="500">500毫秒</option>
      <option :value="1000" selected>1秒</option>
      <option :value="2000">2秒</option>
      <option :value="5000">5秒</option>
    </select>
    <select @change="$emit('updateWindow', $event)" class="ctrl-select">
      <option :value="30">30</option>
      <option :value="60" selected>60</option>
      <option :value="120">120</option>
    </select>
    <button @click="$emit('injectAnomaly')" class="ctrl-btn ctrl-btn-danger">
      🔴 注入异常
    </button>
    <button
      @click="$emit('toggleHighload')"
      :class="['ctrl-btn', { active: highLoad }]"
    >
      ⚡ 高负载
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  toggleRunning: []
  updateRate: [event: Event]
  updateWindow: [event: Event]
  injectAnomaly: []
  toggleHighload: []
}>()

defineProps<{
  running: boolean
  highLoad: boolean
}>()
</script>

<style scoped>
.control-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ctrl-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.ctrl-btn-danger {
  border-color: rgba(255, 107, 107, 0.3);
}

.ctrl-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.ctrl-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='6' viewBox='0 0 8 6'%3E%3Cpath d='M0 0l4 6 4-6z' fill='rgba(255,255,255,0.35)'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

.ctrl-select:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
