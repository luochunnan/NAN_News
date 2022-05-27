<template>
  <div>
    <!-- 一级路由挂载点 -->
    <router-view></router-view>
  </div>
</template>

<script>
// 按需导入这个方法
import { getAllChannelsAPI } from '@/api'
export default {
  // 由于await捕捉不到错误的结果
  // 利用try+catch 来捕获await同步代码的错误
  async created () {
    try {
      const res = await getAllChannelsAPI()
      console.log(res)
    } catch (err) {
      // err参数拿到的就是错误对象
      // 给用户好来个弹窗提示 - 程序出错了
      // console.dir() 详细打印
      console.dir(err)
    }
  }

}
</script>

<style>

</style>
