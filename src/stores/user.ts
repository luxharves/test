import { ref, computed } from 'vue'
import { defineStore } from 'pinia'//定义一个全局仓库


export const useUserStore = defineStore(
  "user",//仓库名字
  {
    state:()=>{
      return{
        name:"古月方源",
        age:66
      }
    },
    actions:{
      addAge(){
        this.age++
      },
      changeName(newName:string){
        this.name=newName
      }
    }
  }
)
