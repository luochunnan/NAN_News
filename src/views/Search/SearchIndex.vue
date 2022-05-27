<template>
  <div>
    <!-- 搜索页面头部 -->
    <div class="search-header">
      <!-- 后退按钮 -->
      <van-icon
        name="arrow-left"
        color="white"
        size="0.48rem"
        class="goback"
        @click="$router.back()"
      />
      <!-- 搜索组件 -->
      <van-search
        v-fofo
        v-model.trim="kw"
        placeholder="请输入搜索关键词"
        background="#007BFF"
        shape="round"
        @input="inputFn"
        @search="searchFn"
      />
    </div>
    <!-- 搜索建议列表 联想菜单-->
    <!-- 搜索历史和联想菜单不能同时出现 -->
    <div class="sugg-list" v-if="kw.length !== 0">
      <div
        class="sugg-item"
        v-for="(str, index) in suggestList"
        :key="index"
        v-html="lightFn(str, kw)"
        @click="suggestClickFn(str)"
      ></div>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-else>
      <!-- 标题 -->
      <van-cell title="搜索历史">
        <!-- 使用 right-icon 插槽来自定义右侧图标 -->
        <template #right-icon>
          <van-icon name="delete" class="search-icon" @click="delFn" />
        </template>
      </van-cell>

      <!-- 历史列表 -->
      <div class="history-list" >
        <span class="history-item" v-for="(str, index) in history"
        :key="index"
        @click="historyClickFn(str)"
        >{{str}}</span>
      </div>
    </div>
  </div>
</template>

<script>
// 目标： 跳转到搜索结果页面
// 1.输入框回车 -> 输入框字 -> 搜索结果页
// 2.点击联想菜单 -> 点击文字 -> 搜索结果页
// 3. 点击历史记录 -》 点击文字 -》搜索结果页
import { suggestListAPI } from '@/api/index.js'
export default {
  data () {
    return {
      kw: '', // 搜索关键字
      timer: null, // 防抖的定时器
      suggestList: [],
      history: JSON.parse(localStorage.getItem('his')) || [] // 搜索历史

    }
  },
  // 输入框 - 内容实时改变触发事件方法
  methods: {
    inputFn () {
      clearTimeout(this.timer) // 清除定时器
      // 防抖： 延时执行逻辑代码，事件再次触发时，清除上一个定时器
      // 有一个bug 当我们把 输入框的内容清空了 列表还是显示内容
      // 加一个判断语句优化 当输入框内容为空时 列表为空
      if (this.kw.length === 0) {
        this.suggestList = []
      } else {
        this.timer = setTimeout(async () => {
          const res = await suggestListAPI({
            keywords: this.kw
          })
          console.log(res)
          this.suggestList = res.data.data.options
        }, 300)
      }
    },

    // 专门处理字符串高亮的关键字
    lightFn (originStr, target) {
      // originStr: 原来的字符串
      // target： 关键字
      // 字符串.replace(taget,要替换的内容) -> 返回值是替换后的 完整字符串
      // 字符串.replace() -> 替换第一个符合条件的
      // 字符串.replaceAll() -> 替换全部
      console.log('originStr的值是', originStr)
      // 如果想要使用变量 作为正则的匹配条件， 不能用语法糖简化写法
      const reg = RegExp(target, 'ig') // i忽略大小写，g全局都匹配
      // 直接这样操作originStr.replace 是后台会报错 ，因此在调用replace方法时， 先判断一下原始字符
      return originStr?.replace(reg, (match) => {
        // match 就是匹配中， 原字符串里的那个字符 用人家原来的 只不过我给他赋予了一个颜色
        return `<span style="color: red;">${match}</span>`
      })
    },
    moveFn (theKw) {
      // 路由跳转传参
      // 方式1: 路径/值(前提: 路由规则:变量名), -> 接收: $route.params
      // 方式2: 路径?参数名=值  ->  接收: $route.query
      // 这2种方式, 你都可以自己在path后面路径拼接
      // 你还可以用$router.push配置项params和query让js代码内帮你拼接

      // 坑: 路由跳转, 在watch之前执行, 所以我们要让路由跳转, 来一个定时器包裹, 让跳转最后执行
      setTimeout(() => {
        this.$router.push({
          path: `/search_result/${theKw}`
        })
      })
    },
    // 输入框 - 搜索事件
    searchFn () {
    //   this.history.push(this.kw)
    //   // 路径上传参 不能用params 只能用下面这种
    //   this.moveFn(this.kw)
      if (this.kw.length > 0) {
        // 搜索关键字 - 保存到数组里
        this.history.push(this.kw)
        this.moveFn(this.kw)
      }
    },
    // 联想菜单 - 点击事件
    suggestClickFn (str) {
      // 搜索关键字 - 保存到数组里
      this.history.push(str)
      this.moveFn(str)
    },
    // 历史记录 -点击事件
    historyClickFn (str) {
      this.moveFn(str)
    },
    delFn () {
      this.history = []
    }

  },
  // 利用侦听器
  watch: {
    history: {
      deep: true,
      handler () {
        // 数组去重
        // Es6 新增了2种引用类型 （以前 Array， Object）（新增：Set Map）
        // Set : 无序不重复的value集合体
        // 特点： 传入的数组类型 如果有重复元素 会自动清理掉重复元素 ，返回无重复的Set对象
        const theSet = new Set(this.history)
        const arr = Array.from(theSet)
        localStorage.setItem('his', JSON.stringify(arr))
      }
    }
  }
}
</script>

<style scoped lang="less">
.search-header {
  height: 46px;
  display: flex;
  align-items: center;
  background-color: #007bff;
  overflow: hidden;
  /*后退按钮*/
  .goback {
    padding-left: 14px;
  }
  /*搜索组件*/
  .van-search {
    flex: 1;
  }
}
/*搜索建议列表样式 */
.sugg-list {
  .sugg-item {
    padding: 0 15px;
    border-bottom: 1px solid #f8f8f8;
    font-size: 14px;
    line-height: 50px;
    // 实现省略号的三行代码
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
/**搜索历史 */
.search-icon {
  font-size: 16px;
  line-height: inherit;
}

.history-list {
  padding: 0 10px;
  .history-item {
    display: inline-block;
    font-size: 12px;
    padding: 8px 14px;
    background-color: #efefef;
    margin: 10px 8px 0px 8px;
    border-radius: 10px;
  }
}
</style>
