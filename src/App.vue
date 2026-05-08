<template>
    <el-button type="primary">点击我</el-button>
    <el-input v-model="input" placeholder="请输入内容" />
    <el-form :model="form">
  <el-form-item label="用户名">
    <el-input v-model="form.name" />
  </el-form-item>

  <el-form-item label="密码">
    <el-input v-model="form.password" />
  </el-form-item>

  <el-button type="primary" @click="submit">
    提交
  </el-button>
</el-form>
<el-dialog v-model="visible"></el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const form = ref({
  name: '',
  password: ''
})

function submit() {
  console.log(form.value)
}
</script>