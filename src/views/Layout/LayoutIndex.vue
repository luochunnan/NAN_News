<template>
  <div>
    <!-- 二级路由挂载点 -->
    <!-- , 给router-view外面, 套一个div.home_container, 并且防止二级页面内容, 被底部导航挡住 -->
    <div class="home_container">
    <router-view></router-view>
    </div>
    <!-- 底部导航 -->
    <div>
      <van-tabbar v-model="active" route>
        <van-tabbar-item
        icon="home-o"
        to="/layout/home"
        >首页</van-tabbar-item>
        <van-tabbar-item
        icon="setting-o"
        to="/layout/user"
        >我的</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      active: 0
    }
  }
}
</script>

<stylescoped lang="less">
/* 内容底部内边距(把内容往上挤压, 防止内部被底部导航挡住) */
.home_container {
  padding-bottom: 50px;
}
/* 底部导航上边框 */
.van-tabbar {
  border-top: 1px solid #f8f8f8;
}
</stylescoped>
