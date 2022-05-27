<template>
  <div>
    <van-nav-bar fixed title="NAN头条资讯">
      <!-- # 是v-slot: 的简写 -->
      <template v-slot:left>
        <img class="logo" src="@/assets/NaN.jpg" alt="" />
        <!-- <p class="font">NAN头条资讯</p> -->
      </template>
      <template #right>
        <!-- postcss只能翻译style里的css样式，标签内行内样式无法自动将px转成rem，需要手动计算 -->
        <!-- size="18" 默认单位是px  18/37.5=0.48rem -->
        <van-icon name="search" size="0.48rem" color="#fff" @click="moveSearchFn"/>
      </template>
    </van-nav-bar>

    <!--
      1.导航栏
        van-tabs 一行容器
        van-tab 每个tab栏
        v-model 关联的是激活项的下标（双向绑定）

        2.（重要） 每一个van-tab 代表一个标签导航， 中间夹着内容， 对应的是下属列表
        3. (重要) 每一个van-tab都有自己独立的ArticleList（多次）
        4. 细节
        van-tab循环了很多标签导航 ， 与之一一对应的内容列表不是上来就都创建了，默认创建当前激活导航对应列表组件
        第一次切换到对应的频道时 才会创建下属的ArticleList组件 -》create方法才执行
        第二次切换就是显示/隐藏切换
        解决方案：由于外面使用的是同一个数组切换数据 （多个ArticleList用的是同一个数组 换的时候会影响别人）
                因此可以将文章列表数据，请求，数组，分别放在ArticleList内部 自己请求自己的数据
       -->
    <div class="main">
      <!-- 46/37.5=226667 -->
      <!-- 添加一个动画效果 看看切换van-tab的独立的ArticleList -->
      <!-- 绑定事件  @change="channelChangeFn" 监测切换tab栏的时候文章列表更新 -->
      <van-tabs
        v-model="channelId"
        @change="channelChangeFn"
        animated
        sticky
        offset-top="1.226667rem"
      >
        <van-tab
          :title="obj.name"
          v-for="obj in UserChannelList"
          :key="obj.id"
          :name="obj.id"
        >
          <!-- 给articleList组件传入所得到的数组 -->
          <ArticleList :channelId="channelId"></ArticleList>
        </van-tab>
      </van-tabs>
      <!-- 编辑频道图标 -->
      <van-icon name="plus" size="0.37333334rem" class="moreChannels" @click="plusClickFn"/>
    </div>
    <!-- 频道弹出层 -->
    <van-popup class="channel_popup" v-model="show" get-container="body">
    <ChannelEdit :userList="UserChannelList" :unCheckList="unCheckChannelList"
    @addChannelEv="addChannelFn"
    @removeChannelEv="removeChannelFn"
    @closeEv="closeFn"
    ref="editRef"
    v-model="channelId"></ChannelEdit>
    </van-popup>
  </div>
</template>

<script>
import ArticleList from './component/ArticleList.vue'
import ChannelEdit from './ChannelEdit.vue'
import { getUserChannelsAPI, getAllChannelsAPI, updateChannelAPI, removeTheChannelAPI } from '@/api'
// import { getAllArticleListAPI } from '@/api'
export default {
  data () {
    return {
      channelId: 0, // tab导航 - 激活索引
      UserChannelList: [], // 用户选择频道列表
      AllChannelList: [], // 获取全部的频道列表
      // articleList: [] // 1.定义一个数组接收文章列表的内容
      show: false
    }
  },
  async created () {
    // 获取的是用户频道列表
    const res = await getUserChannelsAPI()
    console.log(res)
    this.UserChannelList = res.data.data.channels
    // this.channelChangeFn()

    // 获取全部的用户频道列表
    const res2 = await getAllChannelsAPI()
    console.log(res2)
    this.AllChannelList = res2.data.data.channels
    console.log(res2.data.data.channels)
  },
  methods: {
    async channelChangeFn () {
      // // 获取文章的列表
      // const res2 = await getAllArticleListAPI({
      //   channel_id: this.channelId,
      //   timestamp: (new Date()).getTime() // 获取时间戳
      // })
      // console.log(res2)
      // this.articleList = res2.data.data.results // 2.将后台获取的结果保存在articleList
    },
    plusClickFn () {
      this.show = true
    },
    // 因为要将最新数组发送给后台 所以又要用async
    // 添加频道
    async addChannelFn (channelObj) {
      this.UserChannelList.push(channelObj)
      // 由于计算属性的特点 因此无需从unCheckChannelList移除

      // 目标： 把最新的数据传给后台
      // 数组里的对象字段 -> 转换
      // 推荐频道不能传递 -筛选出 不是推荐频道剩下的频道对象
      // const newArr = this.UserChannelList.filter(obj => obj.id !== 0)
      // newArr.forEach((obj, index) => {
      //   delete obj.name
      //   obj.seq = index
      // })
      // const res = await updateChannelAPI({
      //   channels: newArr
      // })
      // console.log(res)

      // 上面的代码出问题了 -- 点击添加时 名字消失了
      // 原因：所有数组的对象 都在同一个内存地址 影响到ChannelEdit。vue的对象
      // 解决方法如下
      const newArr = this.UserChannelList.filter(obj => obj.id !== 0) // 筛选出除了推荐意外的数组
      const theNewArr = newArr.map((obj, index) => { // 用了大括号记得 return
        const newObj = { ...obj } // 拷贝（浅拷贝）
        delete newObj.name
        newObj.seq = index

        return newObj // map方法把新对象收集起来形成一个新数组
      })

      const res = await updateChannelAPI({
        channels: theNewArr
      })
      console.log(res)
    },
    // 删除频道

    async removeChannelFn (channelObj) {
      // 删除需要索引值
      const index = this.UserChannelList.findIndex(obj => obj.id === channelObj.id)
      this.UserChannelList.splice(index, 1) // 删除

      // 两种方式
      // 第一种：把现在用户数组的数据， 再覆盖式的发给后台
      // 需要把上面的更新数组过程，封装一个函数，分别在add和remove里调用（笔记有）
      // 第二种：调用删除接口 -> 现在api/index里面封装删除接口 -> 在此页面调用 如下
      const res = await removeTheChannelAPI({
        channelId: channelObj
      })
      console.log(res)
      // 要注意的是： 删除接口返回状态码是204（No Content） 是没有返回内容
    },
    // 关闭弹出层
    closeFn () {
      this.show = false
      this.$refs.editRef.isEdit = false
    },
    // 首页 - 右上角放大镜点击事件 -> 跳转到搜索页面
    moveSearchFn () {
    // 必须用push 因为需要返回到上一页
      this.$router.push('/search')
    }
  },

  components: {
    ArticleList,
    ChannelEdit
  },
  // 计算属性
  computed: {
    // 目标： 吧所有的频道数组挨个对象取出，在瀛湖已选的频道数组里查找，如果找不到，就让filter方法手机到一个新数组里
    unCheckChannelList () {
      // bigObj 指的是大数组（全部频道）对象  smallObj 指的是 小数组 （用户已选）的对象
      const newArr = this.AllChannelList.filter(bigObj => {
        const index = this.UserChannelList.findIndex(smallObj => {
          return smallObj.id === bigObj.id
        })
        // 如果找到了相同的就不收集 只收集不同的
        if (index > -1) {
          return false
        } else {
          return true
        }
      })
      return newArr
    // 简化写法
      // return this.AllChannelList.filter(bigObj => (this.UserChannelList.findIndex(smallObj => smallObj.id ===
      //  bigObj.id) === -1))
    }
  }

}
</script>

<stylescoped lang="less">
.logo {
  width: 50px;
  height: 50px;
}
.main {
  padding-top: 46px;
}
.font {
  color: #fff;
}
// 设置 tabs 容器的样式
.van-tabs__wrap {
  padding-right: 30px;
  background-color: #fff;
}

// 设置小图标的样式
.moreChannels {
  position: fixed;
  top: 62px;
  right: 8px;
  z-index: 999;

}
.channel_popup{
  width: 100vw;
  height: 100vh;
}
// 也可以给100% 要先html和body 设置100%
// vw和vh是css3新出的单位，参考浏览器窗口的百分比
</stylescoped>
