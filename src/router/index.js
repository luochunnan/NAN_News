import Vue from 'vue'
import VueRouter from 'vue-router'
import { getToken } from '@/utils/token.js'
// import Login from '@/views/Login/indexFile.vue'
// import Layout from '@/views/Layout/LayoutIndex.vue'
// import Home from '@/views/Home/HomeIndex.vue'
// import User from '@/views/User/UserIndex.vue'
// import Search from '@/views/Search/SearchIndex.vue'
// import SearchResult from '@/views/Search/SearchResult.vue'
// import ArticleDetail from '@/views/ArticleDetail/ArticleIndex.vue'
// import UserEdit from '@/views/User/UserEdit.vue'
Vue.use(VueRouter)

// 路由懒加载 - 为了让第一个页面，加载的app.js小一点 ， 打开网页的速度快一点
// 思路： 那组件对应的js 分成若干.js 路由切换到哪个页面，才去加载对应的js文件
// 原因： webpack分析入口时 发现router里上来就import所有页面 所以直接打包进app.js 导致文件很大
// 解决：当路由路径匹配规则时 才发现import引入对应的组件js文件
// 所以将我们的import导入组件 变成以下的导入方式 不必一打开网页就引入所以组件 而是需要谁 再加载谁
const routes = [
  {
    path: '/',
    redirect: '/layout/home' // 默认显示layout和layout下的首页
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "Login" */ '@/views/Login/indexFile.vue')

  },
  {
    path: '/layout',
    component: () => import(/* webpackChunkName: "Layout" */ '@/views/Layout/LayoutIndex.vue'),
    children: [
      {
        path: 'home',
        component: () => import(/* webpackChunkName: "Home" */ '@/views/Home/HomeIndex.vue')
      },
      {
        path: 'user',
        component: () => import(/* webpackChunkName: "User" */ '@/views/User/UserIndex.vue')
      }
    ]
  },
  {
    path: '/search',
    component: () => import(/* webpackChunkName: "Search" */ '@/views/Search/SearchIndex.vue')
  },
  // 搜索结果页面
  {
    path: '/search_result/:kw',
    component: () => import(/* webpackChunkName: "SearchResult" */ '@/views/Search/SearchResult.vue')
  },
  // 文章详情页
  {
    path: '/detail',
    component: () => import(/* webpackChunkName: "ArticleDetail" */ '@/views/ArticleDetail/ArticleIndex.vue')
  },
  // 用户编辑个人资料
  {
    path: '/user_edit',
    component: () => import(/* webpackChunkName: "UserEdit" */ '@/views/User/UserEdit.vue')
  }

]

const router = new VueRouter({
  routes
})
// 路由 - 全局前置守卫 （在路由发生真正跳转前，执行此函数（
// 此函数可以决定路由是否跳转/取消/强制中断切换到别的路由
router.beforeEach((to, from, next) => {
  // 需求 ： 如果已经登录过了， 不要切换到登录页面
  // 下面getToken后面加个 ？ 就是说如果里面是空的 就原地返回空 不然的话会出现报错
  if (getToken()?.length > 0 && to.path === '/login') {
    next('/layout/home')
  } else {
    next() // 其他情况均可以放行
  }
})

export default router
