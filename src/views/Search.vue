<template>
    <h1>搜索页面</h1>
    <p>搜索关键词：{{ route.query.keyword }}</p>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({
  name: 'SearchView',
})

const route=useRoute()
</script>
