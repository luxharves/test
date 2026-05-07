import { createRouter, createWebHistory } from 'vue-router'
import Search from '../views/Search.vue'

const router=createRouter({
  history:createWebHistory(),
  routes:[
    {
      path:"/search",
      component:Search
    }
  ]
})
export default router