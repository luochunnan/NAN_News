<template>
  <div>
    <!-- 弹出层的头部区域 -->
    <van-nav-bar title="频道管理">
      <!-- 插槽 -->
      <template #right>
        <van-icon name="cross" size="0.37333334rem" color="white" @click="closeChannel"/>
      </template>
    </van-nav-bar>
    <!-- 我的频道 -->
    <div class="my-channel-box">
      <div class="channel-title">
        <span>我的频道
          <span class="small-title">
            点击{{ isEdit? '删除' : '进入'}}频道
          </span>
        </span>
        <span @click="editFn">{{ isEdit? '完成' : '编辑'}}</span>
      </div>
      <!-- 我的频道列表 -->
      <van-row type="flex">
        <van-col span="6"
        v-for="obj in userList"
        :key="obj.id"
        @click="userChannelClicFn(obj)">
          <div class="channel-item van-hairline--surround">
            {{obj.name}}
            <!-- 删除的徽标 -->
            <!-- 这里的show 判断 只是为了在推荐上不显示 X 但实际上点击事件是存在的 -->
            <van-badge color="transparent" class="cross-badge" v-show="isEdit && obj.id !== 0">
              <template #content>
                <van-icon
                  name="cross"
                  class="badge-icon"
                  color="#cfcfcf"
                  size="0.32rem"
                />
              </template>
            </van-badge>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 更多频道 -->
    <div class="more-channel-box">
      <div class="channel-title">
        <span>点击添加更多频道：</span>
      </div>
      <!-- 更多频道列表 -->
      <van-row type="flex">
        <van-col span="6"
        v-for="obj in unCheckList"
        :key="obj.id"
        @click="moreFn(obj)">
          <div class="channel-item van-hairline--surround">
            {{obj.name}}
          </div>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
// 目标1 ：编辑频道 -> 显示 x和点击会发生文字变化
// 1.定义isEdit变量 控制x 是否显示
// 2.编辑span标签 利用三元表达式 点击时取反

// 目标2: 编辑频道后 点击更多频道进行新增
// 1.更多频道 -》 绑定点击事件 传递频道对象过去, 要记得做一个判断 只有编辑状态才能进行添加
// 2.利用子 -> 父 把频道对象传给HomeIndex -》父push到用户频道里
export default {
  props: {
    userList: Array,
    unCheckList: Array
  },
  data () {
    return {
      isEdit: false
    }
  },
  methods: {
    // 编辑 - 点击事件
    editFn () {
      this.isEdit = !this.isEdit
    },
    // 添加更多频道 - 点击事件
    moreFn (channelObj) {
      if (this.isEdit === true) {
        this.$emit('addChannelEv', channelObj)
      }
    },
    // 删除用户指定频道 - 点击事件
    userChannelClicFn (channelObj) {
      if (this.isEdit === true) {
        // 再次判读 在编辑状态下 推荐频道不能删除，也不能跳转到推荐频道 而是什么都不做
        if (channelObj.id !== 0) {
          this.$emit('removeChannelEv', channelObj)
        }
        // 这个if 没有对应的else 当if 条件不满足的时候 就什么也不干
      } else { // 如果不点击编辑 直接点击频道 会切换频道且关闭弹出层
        this.$emit('closeEv')
        this.$emit('input', channelObj.id) // 因为时和v-model双向绑定 而且 v-model 本质上会在原地绑定一个input事件，所以这里的事件必须是input
      }
    },
    // 关闭X 弹出层方法
    closeChannel () {
      this.$emit('closeEv')
      // 想要关闭之后重置编辑状态 可以使用两种方法
      // 方法1. 关闭时，直接将isEdit设置为false
      // this.isEdit = false
      // 方法2: 组件标签里使用ref 请看HoneIndex
    }
  }
}
</script>

<style scoped lang="less">
.van-popup,
.popup-container {
  background-color: transparent;
  height: 100%;
  width: 100%;
}

.popup-container {
  display: flex;
  flex-direction: column;
}

.pop-header {
  height: 90px;
  background-color: #007bff;
  color: white;
  text-align: center;
  font-size: 14px;
  position: relative;
  .title {
    width: 100%;
    position: absolute;
    bottom: 15px;
  }
}

.pop-body {
  flex: 1;
  overflow: scroll;
  padding: 8px;
  background-color: white;
}

.my-channel-box,
.more-channel-box {
  .channel-title {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    line-height: 28px;
    padding: 0 6px;
  }
}

.channel-item {
  font-size: 12px;
  text-align: center;
  line-height: 36px;
  background-color: #fafafa;
  margin: 5px;
}

/*删除的微标 */
.cross-badge {
  position: absolute;
  right: -3px;
  top: 0;
  border: none;
}

/*提示文字 */
.small-title {
  font-size: 10px;
  color: gray;
}
</style>
