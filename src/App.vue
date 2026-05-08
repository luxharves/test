<template>
    <h1>
        {{ userStore.name }}
    </h1>
    <h2>{{ userStore.age }}</h2>
    <button @click="userStore.addAge">增加年龄</button>
    <button @click="userStore.changeName('大爱仙尊')">修改名字</button>
    <button @click="getData">获取数sadaadadad据</button>

</template> 

<script setup lang="ts">
import {useUserStore} from "./stores/user"
import {ref} from "vue"
import axios from "axios"
import {onMounted} from "vue"
const userStore = useUserStore()
const userList=ref<any[]>([])
async function getData(){
    const res=await axios({
        url:"https://jsonplaceholder.typicode.com/users",
        method:"get"

    })
    userList.value=res.data
}
onMounted(()=>{
    getData()
})

</script>