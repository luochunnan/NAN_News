<template>
  <!-- 一条文章单元格 -->
  <div>
  <van-cell>
    <!-- 标题区域的插槽 -->
    <template #title>
      <div class="title-box">
        <!-- 标题 -->
        <span>{{ artObj.title }}</span>
        <!-- 单图 -->
        <img
          class="thumb"
          v-if="artObj.cover.type === 1"
          :src="artObj.cover.images[0]"
          alt=""
        />

      </div>

      <!-- 多图 -->
      <div class="thumb-box" v-if="artObj.cover.type > 1">
        <img class="thumb"
        v-for="(imgUrl, index) in artObj.cover.images"
        :key="index"
        :src="imgUrl"
        />
      </div>
    </template>
    <!-- label 区域的插槽 -->
    <template #label>
      <div class="label-box">
        <div>
          <span>{{ artObj.aut_name }}</span>
          <span>{{ artObj.comm_count }}评论</span>
          <span>{{ formatTime(artObj.pubdate) }}</span>
        </div>
        <!-- 反馈按钮 -->
        <!-- 当点击文章list跳转到文章详情页时，发生了事件冒泡 - 点这个 X 图标是不跳出反馈面板，而是跳转到详情页 -->
        <!-- 解决方案： 在这个点击事件使用.stop 阻止事件冒泡 -->
        <van-icon name="cross" @click.stop="show = true " v-if="isShow"/>
      </div>
    </template>
  </van-cell>

  <van-action-sheet
  v-model="show"
  :actions="actions"
  @select="onSelect"
  get-container="body"
  :cancel-text= "bottomText"
  @cancel="cancelFn"
  @close="closeFn"/>
  </div>
</template>

<script>

// 目标1: 点击 “反馈垃圾内容” 数据的切换
// 1. 监听点击时间， 区分用户点击的是哪一个
// 2。 切换actions数组里面的数据

// 目标2； 二级反馈数据出现，取消按钮文字要换成 “返回”
import { timeAgo } from '@/utils/date.js'
import { firstActions, secondActions } from '@/api/report.js'
export default {
  props: {
    artObj: Object,
    // 目标 搜索结果页面的反馈按钮隐藏
    // 定义一个变量 由 使用这个组件的使用者来决定 显示还是隐藏
    isShow: {
      type: Boolean,
      default: true // 如果使用者不传值 则默认显示
    }
  },
  data () {
    return {
      show: false,
      actions: firstActions,
      secondActions,
      bottomText: '取消'
    }
  },
  methods: {
    formatTime: timeAgo, // timeAgo 是函数体
    // 反馈面板 - “选项” 选择事件
    onSelect (actions, item) { // 接收actions值，用于判断
      // 打印actions今儿item 的值 看看这俩是啥
      // console.log(actions) // 打印出来的结果是 ：name: "不感兴趣"
      // console.log(item) // 打印出来的是索引值
      // 默认情况下点击选项时不会自动收起
      // 可以通过 close-on-click-action 属性开启自动收起
      // this.show = false
      if (actions.name === '反馈垃圾内容') {
        this.actions = secondActions
        this.bottomText = '返回'
      } else if (actions.name === '不感兴趣') {
        this.$emit('dislikeEv', this.artObj.art_id)
        this.show = false // 无论成功/失败 - 直接让反馈面板隐藏
      } else { // 二级面板反馈
        this.$emit('reportEv', this.artObj.art_id, actions.value)
        this.show = false
      }
    },
    // 反馈面板-底部按钮- 点击事件
    cancelFn () {
      if (this.bottomText === '返回') {
        this.bottomText = '取消'
        this.actions = firstActions
        this.show = true
      }
    },
    // 反馈面板-关闭面板- 触发事件
    closeFn () {
      this.actions = firstActions
      this.bottomText = '取消'
    }

  }
}

</script>

<style scoped lang="less">
/* 标题样式 */
.title-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* label描述样式 */
.label-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 文章信息span */
.label-box span {
  margin: 0 3px;
  &:first-child {
    margin-left: 0;
  }
}
/* 图片的样式, 矩形黄金比例：0.618 */
.thumb {
  width: 113px;
  height: 70px;
  background-color: #f8f8f8;
  object-fit: cover;
}

/* 三图, 图片容器 */
.thumb-box {
  display: flex;
  justify-content: space-between;
}
</style>
