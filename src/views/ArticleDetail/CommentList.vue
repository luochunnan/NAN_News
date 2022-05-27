<template>
  <div>
    <!-- 评论列表 -->
    <div
      class="cmt-list"
      :class="{
        'art-cmt-container-1': isShowCmtBox,
        'art-cmt-container-2': !isShowCmtBox,
      }"
    >
      <!-- 评论的 Item 项 -->
      <!-- 2.van-list 包裹列表，组件内源码，检测网页滚动事件，判断滚动位置是否快到达内部高度（触底）
      -> 触发load事件执行 -》 loading : 为 true -》底部的’加载中‘文字出现 内部认为现在处于加载中状态 -->
      <!-- 3.:immediate-check="false" 作用 就是让list组件不要一上来就触底加载
      原因是： list中的列表内容是异步请求回来的 标签挂载时 还没有高度 list就会判定触底执行一次load事件 -->
      <!--  存在的问题就是 created一上来就执行 接着onload又发送一次 如果没有页码++ 会请求2次第一页的数据，如果有page++ 会上来就请求第一第二页的数据 -->
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多评论了奥"
        @load="onLoad"
        :immediate-check="false"
      >
        <div class="cmt-item" v-for="obj in commentArr" :key="obj.com_id">
          <!-- 头部区域 -->
          <div class="cmt-header">
            <!-- 头部左侧 -->
            <div class="cmt-header-left">
              <img :src="obj.aut_photo" alt="" class="avatar" />
              <span class="uname">{{ obj.aut_name }}</span>
            </div>
            <!-- 头部右侧 -->
            <div class="cmt-header-right">
              <van-icon
                name="like"
                size="16"
                color="red"
                v-if="obj.is_liking === true"
                @click="likeFn(true, obj)"
              />
              <van-icon
                name="like-o"
                size="16"
                color="gray"
                @click="likeFn(false, obj)"
                v-else
              />
            </div>
          </div>
          <!-- 主体区域 -->
          <div class="cmt-body">
            {{ obj.content }}
          </div>
          <!-- 尾部区域 -->
          <div class="cmt-footer">{{ timeAgo(obj.pubdate) }}</div>
        </div>
      </van-list>
    </div>
    <!-- 发表评论的容器 -->
    <div>
      <!-- 底部添加评论区域 - 1 -->
      <div class="add-cmt-box van-hairline--top" v-if="isShowCmtBox === true">
        <van-icon name="arrow-left" size="0.48rem" @click="$router.back()" />
        <div class="ipt-cmt-div" @click="toggleShowFn">发表评论</div>
        <div class="icon-box">
          <van-badge :content="totalCount === 0 ? '' : totalCount" max="99">
            <van-icon name="comment-o" size="0.53333334rem" />
          </van-badge>
          <van-icon name="star-o" size="0.53333334rem" />
          <van-icon name="share-o" size="0.53333334rem" />
        </div>
      </div>

      <!-- 底部添加评论区域 - 2 -->
      <div class="cmt-box van-hairline--top" v-else>
        <textarea
          placeholder="友善评论、理性发言、阳光心灵"
          v-fofo
          @blur="blurFn"
          v-model.trim="textValue"
        ></textarea>
        <van-button
          type="default"
          :disabled="textValue.length === 0"
          @click="sendFn"
          >发布</van-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import {
  commentListAPI,
  commentLikeAPI,
  commentDisLikeAPI,
  commentSendAPI
} from '@/api'
import { timeAgo } from '@/utils/date'
export default {
  data () {
    return {
      offset: null, // 偏移量评论id
      commentArr: [],
      isShowCmtBox: true,
      totalCount: '', // 评论总数
      textValue: '', // 评论框的内容
      finished: false,
      loading: false,
      lastId: null // 更多评论的分页
    }
  },
  // 获取评论列表
  async created () {
    const res = await commentListAPI({
      id: this.$route.query.art_id
    })
    console.log(res)
    this.commentArr = res.data.data.results
    this.totalCount = res.data.data.total_count
    this.lastId = res.data.data.last_id // 分页

    // 如果打开文章发现没有文字
    // 显示没有评论
    if (res.data.data.results.length === 0) {
      this.finished = true
    }
  },
  methods: {
    timeAgo,
    // 评论的小心心， 点赞 / 取消点赞
    async likeFn (bool, commentObj) {
      // 不能使用this.obj.is_liking 因为this指的是data obj是上面的 所以得传下来
      // 点击 “红心” - 取消点赞 - 变成 “灰心”
      if (bool === true) {
        commentObj.is_liking = false
        await commentDisLikeAPI({
          comId: commentObj.com_id
        })
      } else {
        // 点击 “灰心心” - 点赞 - 变成 “红心心”
        commentObj.is_liking = true
        await commentLikeAPI({
          comId: commentObj.com_id
        })
      }
    },
    toggleShowFn () {
      this.isShowCmtBox = false
    },
    // 发布评论按钮 - 点击事件
    async sendFn () {
      //   console.log(this.textValue)
      //   this.textValue = ''
      // 前端效果 ： 把评论加入到列表里
      const res = await commentSendAPI({
        id: this.$route.query.art_id,
        content: this.textValue
      })
      console.log(res)
      this.commentArr.unshift(res.data.data.new_obj)
      this.textValue = ''
      this.totalCount++
    },
    // 失去焦点 - 延时
    blurFn () {
      // 有一个bug 点击发布按钮的时候 发现点击事件不执行 - 排除代码问题
      // 原因： 高的评论容器 -在页面点击发布的一瞬间- 执行了失去焦点 -被 v-if 和 v-else 移除了整个标签
      // 导致发布的点击事件 未来得及执行
      // 解决方案： 给blur 一个定时器 （异步操作） 在最后执行
      setTimeout(() => {
        this.isShowCmtBox = true
      })
    },
    // 加载更多评论
    async onLoad () {
      // 已经在组件标签添加了:immediate-check="false" 所以可以不用判断了

      // 但是immediate-check 在内部不要进行判断 监听滚动事件的代码还在
      // 第一个频道滚动到底部的时候 这是切换到第二个频发哦的时候 这时候滚动还是会从底部滚动回到顶部
      // 这时候发生了滚动，所以滚动事件还是触发了，immediate-check的判断无效了
      // 这时候需要加上判断 进行双保险

      if (this.commentArr.length > 0) {
      // 请求下一页数据
        const res = await commentListAPI({
          id: this.$route.query.art_id, // 文章id
          offset: this.lastId
        })
        console.log(res)
        this.commentArr = [...this.commentArr, ...res.data.data.results]
        this.totalCount = res.data.data.total_count // 总数量
        this.lastId = res.data.data.last_id // 分页
        if (res.data.data.last_id === null) {
        // 没有下一页了
        // 如果finished为true, 以后触底不再执行load事件
          this.finished = true
        }
        this.loading = false
      } else {
        // 4. 如果不加immediate-check, 上来走一次onLoad, loading状态为true, 但是if又进不去
        // 等created数据回来撑开高度, 滚动到底部时, loading为true就不会重新执行onLoad方法了
        // 效果: 一直转圈
        // 解决: if进不去, 进else里把状态关闭掉
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="less">
.cmt-list {
  padding: 10px;
  .cmt-item {
    padding: 15px 0;
    + .cmt-item {
      border-top: 1px solid #f8f8f8;
    }
    .cmt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .cmt-header-left {
        display: flex;
        align-items: center;
        .avatar {
          width: 40px;
          height: 40px;
          background-color: #f8f8f8;
          border-radius: 50%;
          margin-right: 15px;
        }
        .uname {
          font-size: 12px;
        }
      }
    }
    .cmt-body {
      font-size: 14px;
      line-height: 28px;
      text-indent: 2em;
      margin-top: 6px;
      word-break: break-all;
    }
    .cmt-footer {
      font-size: 12px;
      color: gray;
      margin-top: 10px;
    }
  }
}

/*美化 - 文章详情 - 底部的评论页面 */
// 外层容器
.art-cmt-container-1 {
  padding-bottom: 46px;
}
.art-cmt-container-2 {
  padding-bottom: 80px;
}

// 发布评论的盒子 - 1
.add-cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  line-height: 46px;
  padding-left: 10px;
  .ipt-cmt-div {
    flex: 1;
    border: 1px solid #efefef;
    border-radius: 15px;
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    padding-left: 15px;
    margin-left: 10px;
    background-color: #f8f8f8;
  }
  .icon-box {
    width: 40%;
    display: flex;
    justify-content: space-evenly;
    line-height: 0;
  }
}

.child {
  width: 20px;
  height: 20px;
  background: #f2f3f5;
}

// 发布评论的盒子 - 2
.cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-left: 10px;
  box-sizing: border-box;
  background-color: white;
  textarea {
    flex: 1;
    height: 66%;
    border: 1px solid #efefef;
    background-color: #f8f8f8;
    resize: none;
    border-radius: 6px;
    padding: 5px;
  }
  .van-button {
    height: 100%;
    border: none;
  }
}
</style>
