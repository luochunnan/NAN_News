<template>
  <div>
    <!-- 循环一次数 就对应一次AriticleItem -->
    <!-- 真正显示数据的是AriticleItem 因此还得要再去ArticleItem设置props -->

    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" success-text="刷新成功">

    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      offset="50"
      :immediate-check="false"
    >
      <ArticleItem
        v-for="obj in list"
        :key="obj.art_id"
        :artObj="obj"
        @dislikeEv="dislikeFn"
        @reportEv="reportFn"
        @click.native="itemClickFn(obj.art_id)"
      ></ArticleItem>
    </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import ArticleItem from '../../../components/ArticleItem.vue'
import { getAllArticleListAPI, dislikeArticleAPI, reportArticleAPI } from '@/api'
import { Notify } from 'vant'
export default {
  props: {
    // list: Array // 接收HomeIndex传过来的数据 list是一个数组对象
    channelId: Number // 通过频道id来获取当前频道的文章数据
  },
  components: {
    ArticleItem
  },
  data () {
    return {
      list: [], // 文章列表数组
      loading: false, // 底部加载状态
      finished: false, // 底部完成状态
      theTime: new Date().getTime(), // 分页
      isLoading: false // 顶部刷新
    }
  },
  created () {
    this.getArticleListFn()
  },
  methods: {
    // 网络请求代码的合并优化 -- 专门负责发生请求
    async getArticleListFn () {
      const res = await getAllArticleListAPI({
        channel_id: this.channelId,
        timestamp: this.theTime // 获取时间戳
      })
      console.log(res)
      // create()第一次打开时是空数组 然后
      this.list = [...this.list, ...res.data.data.results]

      // pre_timestamp
      // 下一段开头的那篇文章时间戳
      // 第一次 系统时间（timestramp) -> 后台 返回0-9条数据 -> 携带第10条pre_timestamp值返回
      // 第二次 （timestramp） 上一次 pre_timestamp（代表告诉后，从指定时间戳再往后找10个） 10-19 ，20条
      this.theTime = res.data.data.pre_timestamp

      this.loading = false// 如果不关闭， 底部一只是加载中的状态 下次触底会再出发onload

      if (res.data.data.pre_timestamp === null) { // 本次回来的数据是最后的 没有下一页了
        this.finished = true
      }
      // 顶部加载状态改为false
      this.isLoading = false
    },

    // 底部加载的方法
    async onLoad () {
      if (this.list.length === 0) {
        this.loading = false
        return
      }
      this.getArticleListFn()
    },
    // 顶部-刷新数据事件方法
    async onRefresh () {
      // 需要网络请求 和底部加载一样 直接复制过来就好
      // 顶部刷新目标是 将list[]清空 再重新来一份新的数据
      this.list = []
      this.theTime = new Date().getTime() // 页码回归第一页
      // 调用封装好的网络请求接口
      this.getArticleListFn()
    },
    // 反馈-不感兴趣
    async dislikeFn (id) {
      try {
        await dislikeArticleAPI({
          artId: id
        })
        Notify({ type: 'success', message: '反馈成功' })
        console.log('成功了')
      } catch (err) {
        console.log('失败了')
      }
    },
    // 反馈 - 垃圾内容
    async reportFn (id, value) {
      await reportArticleAPI({
        artId: id,
        type: value
      })
      Notify({
        type: 'success', message: '举报成功'
      })
    },
    //  文章单元格-点击事件-跳转文章详情
    itemClickFn (id) {
      this.$router.push({
        path: `/detail?art_id=${id}`
      })
    }

  }
}
</script>

<style>
</style>
