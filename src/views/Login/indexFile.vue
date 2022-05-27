<template>
  <div>
    <van-nav-bar title="NAN头条资讯-登录" />
    <!--
      rules属性配置检验规则
      :属性名 = "表达式" --》动态属性
      属性名 = "字符串" -- 》静态属性
     -->
    <van-form @submit="onSubmit">
      <van-field
        v-model="user.mobile"
        required
        name="mobile"
        label="手机号"
        placeholder="请输入11位手机号"
        :rules="[{ required: true, message: '请填写正确的手机号', pattern: /^1[3-9]\d{9}$/}]"
      />
      <van-field
        v-model="user.code"
        required
        type="password"
        name="code"
        label="密码"
        placeholder="请输入6位的密码"
        :rules="[{ required: true, message: '请填写密码', pattern: /^\d{6}$/ }]"
      />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit"
        :disabled="isLoading"
        :loading="isLoading"
        loading-text="加载中..."
        >登录</van-button>
      </div>
    </van-form>

  </div>
</template>

<script>
import { LoginAPI } from '@/api/index.js'
import { Notify } from 'vant'
import { setToken } from '@/utils/token.js'

// 1.html +  css
// 2. 铺设数据
export default {
  data () {
    return {
      user: {
        mobile: '13456789102', // 手机号
        code: '' // 验证码，（密码必须是246810 - 这是后台规定的，无论手机号是啥， 这里用的是模拟验证码
      },
      isLoading: false
    }
  },
  methods: {
    async onSubmit (values) {
      console.log('submit', values)

      // 打开网页是按钮状态设置为true
      this.isLoading = true

      try {
        const res = await LoginAPI(this.user)
        console.log(res)
        Notify({ type: 'success', message: '登录成功' })
        setToken(res.data.data.token) // 保存token值
        localStorage.setItem('refresh_token', res.data.data.refresh_token) // 在本地存一个刷新token
        // 跳转一定要写在最后 -> 尽量最后执行
        // 原因是为了避免 跳转之后 还有代码 未执行
        // location.href -> 当前浏览器地址和要跳转的地址一样（不包含#后面锚点信息） 就不会刷新网页
        // 地址改变， 就会导致网页刷新
        // this.$router.push() 压栈（会产生历史记录，可以回退）， this.$router.repalce() 替换 不会产生历史记录
        this.$router.replace({
          path: '/layout/home'
        })
      } catch (err) {
        Notify({ type: 'danger', message: '账号或者密码错误' })
      }
      this.isLoading = false
      // 网络请求完成后 将按钮状态设置为false
    }

  }
}
</script>

<style scoped lang="less">
//但是一般很少用这种写类名的方式
//而是直接修改组件

// 此类名是van-nav-bar组件内的根标签
// .van-nav-bar{
//    background: #007bff;
// }
  /* 此选择器名字时van-nav-bar组件内的标签
  scoped尝试把此标签后属性选择器匹配当前页面标签
  */
  // lang="less" 当前style标签内是less语法
  // 用 /deep/就不会标红
// /deep/ .van-nav-bar__title{
//   color:white
// }
</style>
