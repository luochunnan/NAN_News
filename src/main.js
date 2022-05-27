import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'amfe-flexible'// 引入的目的 设置根标签字体大小（移动端适配）
import { NavBar, Form, Field, Button, Tabbar, TabbarItem, Icon, Tabs, Tab, Cell, List, PullRefresh, ActionSheet, Popup, Row, Col, Badge, Search, Divider, Tag, CellGroup, Image, Dialog, DatetimePicker } from 'vant'

Vue.use(DatetimePicker)
Vue.use(Dialog)
Vue.use(Image)
Vue.use(CellGroup)
Vue.use(Tag)
Vue.use(Divider)
Vue.use(Search)
Vue.use(Row)
Vue.use(Col)
Vue.use(Badge)
Vue.use(Popup)
Vue.use(ActionSheet)
Vue.use(PullRefresh)
Vue.use(List)
Vue.use(Cell)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Icon)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Button)
Vue.use(NavBar)
Vue.use(Form)
Vue.use(Field)
Vue.config.productionTip = false

// 全局自定义指令 - 实现跳转到search页面是时 搜索栏能够自动聚焦
// 指令所在van-search组件根标签是一个div input在内部
Vue.directive('fofo', {
  inserted (el) { // 原生js
    // console.log(el) // 通过打印知道组件根标签是一个div input在内部
    // el.focus() 所以不能直接使用这句
    // 先找到input标签
    // 搜索页面 - el是div
    // 文章评论 - el 是texarea
    // 以后的el也可能是input
    // 所以可以通过 原生的DOM.nodeName 拿到标签的名字 （注意是大写的字符串）
    if (el.nodeName === 'TEXTAREA' || el.nodeName === 'INPUT') {
      el.focus()
    } else {
      // el 本身不是输入框 尝试往里获取
      const theInput = el.querySelector('input')
      const theTextarea = el.querySelector('textarea')
      if (theInput) theInput.focus()
      if (theTextarea) theTextarea.focus()
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
