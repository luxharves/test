<template>
  <div>
    点赞数：{{ count }}

    <button @click="addLike">
      点赞
    </button>
  </div>
</template>

<script setup lang="ts">

// 接收 props
defineProps<{
  count: number
}>()

// 定义 emit
const emit = defineEmits<{
  'add-like': []
}>()

// 点击按钮
function addLike() {
  emit("add-like")
}
</script>
