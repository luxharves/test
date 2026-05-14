<template>
  <div class="event-feed monitor-card">
    <div class="feed-header">事件日志</div>
    <div class="feed-list">
      <TransitionGroup name="feed">
        <div
          v-for="item in slicedItems"
          :key="item.id"
          class="feed-item"
        >
          <span class="feed-time">{{ item.time }}</span>
          <span :class="['feed-badge', item.badge]">{{ item.label }}</span>
          <span class="feed-msg">{{ item.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventFeedItem } from '../types'

const props = defineProps<{
  items: EventFeedItem[]
}>()

const MAX_ITEMS = 20

const slicedItems = computed(() => {
  return props.items.slice(-MAX_ITEMS)
})
</script>

<style scoped>
.feed-header {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.feed-list {
  max-height: 340px;
  overflow-y: auto;
}

.feed-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.feed-time {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  flex-shrink: 0;
}

.feed-badge {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}

.feed-badge.ok {
  color: var(--success);
  background: rgba(93, 242, 167, 0.12);
}

.feed-badge.warn {
  color: var(--warning);
  background: rgba(245, 176, 65, 0.12);
}

.feed-badge.err {
  color: var(--danger);
  background: rgba(255, 107, 107, 0.12);
}

.feed-msg {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}

.feed-enter-active {
  animation: feed-enter 0.3s ease;
}

.feed-leave-active {
  animation: feed-enter 0.2s ease reverse;
}
</style>
