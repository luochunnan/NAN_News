<template>
  <div class="user-edit-container">
    <!-- Header 区域 -->
    <van-nav-bar
      title="编辑资料"
      left-arrow
      @click-left="$router.back()"
      fixed
    />

    <!-- 用户资料 -->
    <van-cell-group class="action-card">
      <van-cell title="头像" is-link center>
        <template #default>
          <van-image
            round
            class="avatar"
            :src="profileObj.photo"
            @click="imageClickFn"
          />
          <!-- file 选择框 -->
          <input
            type="file"
            ref="iptFile"
            v-show="false"
            accept="image/*"
            @change="onFileChange"
          />
        </template>
      </van-cell>
      <van-cell
        title="名称"
        :value="profileObj.name"
        is-link
        @click="nameClickFn"
      />
      <van-cell title="生日" :value="profileObj.birthday" is-link
      @click="birthdayClickFn"
      />
    </van-cell-group>

    <!-- 姓名修改弹出窗口 -->
    <van-dialog
      v-model="show"
      title="标题"
      show-cancel-button
      :beforeClose="beforeCloseFn"
    >
      <input type="text" v-model="inputUserName" v-fofo />
    </van-dialog>

    <!-- 外面套一个蒙层 -->
    <van-popup v-model="dateTimePickerShow" position="bottom" :style="{ height: '50%' }">
      <!-- 时间选择器 -->
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择年月日"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="confirmFn"
        @cancel="cancelFn"
      />
    </van-popup>
  </div>
</template>

<script>
import {
  userProfileAPI,
  updateUserPhotoAPI,
  updateUserProfileAPI
} from '@/api'
import { formatDatte } from '@/utils/date.js'
import { Notify } from 'vant'
export default {
  name: 'UserEdit',
  data () {
    return {
      profileObj: {}, // 获取个人信息的对象
      show: false,
      inputUserName: '',
      minDate: new Date(1950, 0, 1),
      maxDate: new Date(),
      currentDate: new Date(),
      dateTimePickerShow: false
    }
  },
  async created () {
    const res = await userProfileAPI()
    console.log(res)
    this.profileObj = res.data.data // 存放获取的个人信息
  },
  methods: {
    // 文件选择改变 - 点击事件
    async onFileChange (e) {
      if (e.target.files.length === 0) return
      console.log(e.target.files[0]) // （用户选中的文件对象）数组其实是一个特殊对象
      // 创建FormData对象
      const theFd = new FormData()
      theFd.append('photo', e.target.files[0]) // append()是表单的固定方法 获取的键值对 photo是文档里给的

      const res = await updateUserPhotoAPI(theFd)
      console.log(res)
      this.profileObj.photo = res.data.data.photo
    },
    // 更改头像 - 点击事件
    imageClickFn () {
      this.$refs.iptFile.click() // js模拟标签的触发
    },
    // 修改姓名 - 事件
    nameClickFn () {
      this.show = true
      this.inputUserName = this.profileObj.name
    },
    // 姓名 - 确认框
    async beforeCloseFn (action, done) {
      // 先打印action 发现action取值为confirm 、concel
      // console.log(action)
      if (action === 'confirm') {
        // 点击的是确认
        const reg = /^[A-Za-z0-9\u4e00-\u9fa5]{1,7}$/
        if (reg.test(this.inputUserName) === true) {
          await updateUserProfileAPI({
            name: this.inputUserName
          })
          this.profileObj.name = this.inputUserName
          // 通过校验
          done()
        } else {
          Notify({
            type: 'warning',
            message: '用户名只能是1-7位中英文数字组合'
          })
          done(false)
        }
      } else {
        // 点击的是取消
        done()
      }
    },
    // 生日单元格 - 点击事件
    birthdayClickFn () {
      this.dateTimePickerShow = true
      this.currentDate = new Date(this.profileObj.birthday)
    },
    // 日期选择器取消事件
    cancelFn () {
      this.dateTimePickerShow = false
    },
    // 日期选择器确认事件
    async confirmFn () {
      // 日期选择器组件里的currentDate是日期对象，而后端要的是年-月-日字符串
      await updateUserProfileAPI({
        birthday: formatDatte(this.currentDate)
      })
      this.dateTimePickerShow = false
      this.profileObj.birthday = formatDatte(this.currentDate) // 单元格要同步
    }
  }
}
</script>

<style lang="less" scoped>
.user-edit-container {
  padding-top: 46px;
  .avatar {
    width: 50px;
    height: 50px;
  }
}
/deep/ .van-dialog__content {
  text-align: center;
}
</style>
