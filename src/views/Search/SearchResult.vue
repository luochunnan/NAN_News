<template>
  <div>
    <!-- 搜索结果页-头部导航 -->
    <div class="search-result-container">
      <!-- 点击实现后退效果 -->
      <van-nav-bar
        title="搜索结果"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
      />
    </div>
    <!--  文章列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      :immediate-check="false"
    >
      <ArticleItem
        v-for="obj in articleList"
        :key="obj.art_id"
        :artObj="obj"
        :isShow="false"
        @click.native="itemClickFn(obj.art_id)"
      ></ArticleItem>
      <!--  事件修饰符 .native -> 给组件内根标签， 绑定原生click点击事件  -->
      <!-- 为了实现组件的复用性 不在被调用的组件内使用点击事件 而是在使用者这里使用事件修饰符绑定 -->
    </van-list>
  </div>
</template>

<script>
import { searchResultAPI } from '@/api'
import ArticleItem from '@/components/ArticleItem.vue'
export default {
  name: 'SearchResult',
  data () {
    return {
      page: 1,
      articleList: [], // 页码
      finished: false,
      loading: false
    }
  },
  async created () {
    const res = await searchResultAPI({
      page: this.page,
      q: this.$route.params.kw
    })
    console.log(res)
    this.articleList = res.data.data.results
  },
  components: {
    ArticleItem
  },
  methods: {
    // 上拉加载更多
    async onLoad () {
      if (this.articleList.length > 0) {
        this.page++
        const res = await searchResultAPI({
          page: this.page,
          q: this.$route.params.kw
        })
        // 如果没有更多加载的数据了
        if (res.data.data.results.length === 0) {
          this.finished = true
          return
        }
        this.articleList = [...this.articleList, ...res.data.data.results]

        this.loading = false
      }
    },
    // 跳转到详情页
    itemClickFn (id) {
      // console.log('111')
      this.$router.push({
        path: `/detail?${id}`
      })
    }
  }
}
</script>

<style lang="less" scoped>
.search-result-container {
  padding-top: 46px;
}
</style>
