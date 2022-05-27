<template>
  <div>
    <!-- Header 区域 -->
    <van-nav-bar
      fixed
      title="文章详情"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 文章信息区域 -->
    <div class="article-container">
      <!-- 文章标题 -->
      <h1 class="art-title">{{artObj.title}}</h1>

    <!-- 用户信息 -->
        <van-cell center :title="artObj.aut_name" :label="formatDate(artObj.pubdate)">
          <template #icon>
            <img :src="artObj.aut_photo" alt="" class="avatar" />
          </template>
          <template #default>
            <div>
              <van-button type="info" size="mini" v-if="artObj.is_followed === true"
              @click="followedFn(true)"
              >已关注</van-button>
              <van-button icon="plus" type="info" size="mini" plain v-else
              @click="followedFn(false)"
                >关注</van-button
              >
            </div>
          </template>
        </van-cell>

      <!-- 分割线 -->
      <van-divider></van-divider>

      <!-- 文章内容 -->
      <div class="art-content"
      v-html="artObj.content"></div>

      <!-- 分割线 -->
      <van-divider>End</van-divider>

      <!-- 点赞 -->
      <div class="like-box">
        <van-button icon="good-job" type="danger" size="small"
        v-if="artObj.attitude === 1"
        @click="likeFn(true)"
          >已点赞</van-button
        >
        <van-button icon="good-job-o" type="danger" plain size="small" v-else
          @click="likeFn(false)"
          >点赞</van-button
        >
      </div>
    </div>

    <!-- 文章评论部分 -->
    <div>
      <CommentList></CommentList>
    </div>
  </div>
</template>

<script>
import { detailAPI, userFollowAPI, userUnFollowAPI, likeArticleAPI, UnlikeArticleAPI } from '@/api'
import { timeAgo } from '@/utils/date'
import CommentList from '@/views/ArticleDetail/CommentList.vue'
export default {
  data () {
    return {
      artObj: {} // 文章对象
    }
  },
  // 要在打开页面的时候就获取接口传过来的数据
  async created () {
    const res = await detailAPI({
      // id是路由？传过来的 所以获取id用query查询字符串 获取 路由后面的 ？的值
      artId: this.$route.query.art_id
    })
    console.log(res)
    this.artObj = res.data.data
  },
  components: {
    CommentList
  },
  methods: {

    formatDate: timeAgo,
    // 关注 / 取关 作者
    async followedFn (bool) {
      if (bool === true) {
        // 点击已关注 -》 取关 -> artObj.is_followed === false
        // 页面 -> 取关接口
        this.artObj.is_followed = false
        const res = await userUnFollowAPI({
          userId: this.artObj.aut_id
        })
        console.log(res)
      } else {
        // 点击关注 -> 关注 -> artObj.is_followed === true
        this.artObj.is_followed = true
        // 页面 -> 关注接口
        const res = await userFollowAPI({
          userId: this.artObj.aut_id
        })
        console.log(res)
      }
    },
    // 点赞 / 取消点赞
    async likeFn (bool) {
      if (bool === true) {
        // 点击 “已点赞” -> 取消点赞 -> 显示点赞按钮
        // 业务接口 -> 取消点赞接口
        this.artObj.attitude = 0
        const res = await UnlikeArticleAPI({
          artId: this.artObj.art_id
        })
        console.log(res)
      } else {
        // 点击 “点赞” -> 点赞 -> 显示已点赞按钮
        // 业务接口 -> 点赞接口
        this.artObj.attitude = 1
        const res = await likeArticleAPI({
          artId: this.artObj.art_id
        })
        console.log(res)
      }
    }
  }

}
</script>

<style scoped lang="less">
/deep/.van-nav-bar .van-icon{
  color: #fff;
}
.article-container {
  padding: 10px;
  margin-top: 46px;
}
.art-title {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}

.art-content {
  font-size: 12px;
  line-height: 24px;
  width: 100%;
  overflow-x: scroll;
  word-break: break-all;
  /deep/ img {
    width: 100%;
  }
  /deep/ pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.van-cell {
  padding: 5px 0;
  &::after {
    display: none;
  }
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f8f8f8;
  margin-right: 5px;
  border: none;
}

.like-box {
  display: flex;
  justify-content: center;
}
</style>
