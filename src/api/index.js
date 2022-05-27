// 同意封装借口方法
// 每个方法负责请求url地址
// 逻辑页面导入这个接口方法，就能够发请求
// 好处： 请求url 可以在这里统一管理
import request from '@/utils/request.js'
// import { getToken } from '@/utils/token.js'
// return 和 {} 可以一起shenglve
// const getAllChannelsAPI = () => {
//   return axios({
//     url: '/v1_0/channels',
//     method: 'GET'
//   })
// }

// 登录 -登录接口
// axios内部，会把参数对象转成json字符串格式发给后台
// axios内部， 会自动携带请求参数（header）里
export const LoginAPI = ({ mobile, code }) => request({
  url: '/v1_0/authorizations',
  method: 'POST',
  data: {
    mobile,
    code
  }
})
// 用户 - 刷新token
export const getNewTokenAPI = () => request({
  // 在utils/reque.js 封装的请求拦截器携带的是token，而这次请求需要带的是 refresh_token
  // 所以在axios请求拦截器里的攀附安，就是为了这种情况准备的
  url: '/v1_0/authorizations',
  method: 'PUT',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('refresh_token')
  }
})

// 用户 - 关注
export const userFollowAPI = ({ userId }) => request({
  url: '/v1_0/user/followings',
  method: 'POST',
  // body 是请求体 所以用data传参
  data: {
    target: userId
  }
})
// 用户 - 取消关注
export const userUnFollowAPI = ({ userId }) => request({
  url: `/v1_0/user/followings/${userId}`,
  method: 'DELETE'

})
// 用户 -获取个人资料 - 用于编辑个人信息时使用
export const userProfileAPI = () => request({
  url: '/v1_0/user/profile'

})
// 用户 - 获取个人基本信息
export const getUserInfoAPI = () => request({
  url: '/v1_0/user'

})
// 用户 - 更新头像
export const updateUserPhotoAPI = (fd) => request({
  url: '/v1_0/user/photo',
  method: 'PATCH',
  data: fd // fd是外面传进来的 new FormData () 表单对象 这只是个变量 不用加大括号
  // 如果请求体直接时FormDate表单对象 也不用自己添加
  // content-type axios发现数据请求体是表单对象 他不会转换成json字符串
  // 也不会带Content—Type ： application/json， 而是交给浏览器，浏览器发现请求体是FormDate回自己携带Content—Type

  // Content-Type： application/json； 是由axios携带的， 前提是 ： data请求体是对象 -> json字符串 -> 发给后台
  // Content-Type ： multipart/form-data; 是浏览器携带，前提： data请求体必须是FormData类型对象

})

// 用户 -更新基本资料
export const updateUserProfileAPI = (dataObj) => {
  // 判断 ，有值才传给后台 无值参数名不携带
  // 写法1 解构赋值，4个判断，在往空对象上添加有值的加上去 （做过？）
  // 写法2 外面想传几对象 key + value ，就直接传入给后台
  // 写法3 上面写法不够语义化
  const obj = {
    name: '',
    gendrt: 0,
    birthday: '',
    intro: ''
  }
  for (const prop in obj) { // 遍历参数对象的每一个key
    if (dataObj[prop] === undefined) { // 用key去外面传入的参数对象匹配， 如果没有找到 （证明外面没传这个参数
      delete obj[prop] // 从obj身上移除这对属性和值
    } else {
      obj[prop] = dataObj[prop] // 如果使用了，就从外面对象取出对应的key值，保存到obj上
    }
  }
  return request({
    url: '/v1_0/user/profile',
    method: 'PATCH', // 局部更新 'PUT' 全局更新
    data: obj // data 不会忽略值为null的那对key+value ， params遇到null值会忽略 不携带次参数到后台
  })
}

// 频道- 获取所有频道
export const getAllChannelsAPI = () => request({
  url: '/v1_0/channels',
  method: 'GET'
})

// 频道- 获取 - 获取用户选择的频道
// 注意： 用户如果没登录 默认返回后台设置的默认频道列表
export const getUserChannelsAPI = () => request({
  url: '/v1_0/user/channels'
  // 已经在utils里面 的请求拦截器 统一携带了headers 因此这里面无需再有了
  // headers: {
  //   Authorization: `Bearer ${getToken()}`
  // }
})
// 频道 - 更新覆盖频道
export const updateChannelAPI = ({ channels }) => request({
  url: '/v1_0/user/channels',
  method: 'PUT',
  // 要在body里传值
  data: {
    channels // 用户已选的整个频道数组
  }
})
// 频道 -删除用户指定的频道
export const removeTheChannelAPI = ({ channelId }) => request({
  url: `/v1_0/user/channels/${channelId}`,
  method: 'DELETE'
})

// 文章 -获取列表
export const getAllArticleListAPI = ({ channel_id, timestamp }) => request({
  url: '/v1_0/articles',
  method: 'GET',
  // headers: {
  //   Authorization: `Bearer ${getToken()}`
  // },
  params: { // 这里的参数 ， axios会帮你拼接到 URL 后面（查询字符串）
    channel_id,
    timestamp
  }
})

// 文章 - 反馈 - 不感兴趣】
export const dislikeArticleAPI = ({ artId }) => request({
  url: '/v1_0/article/dislikes',
  method: 'POST',
  // headers: {
  //   // 文档里要求的headers 要有两个参数 但是因为内部用的是axios 会默认把我的参数转成json字符串，因此会自动帮我携带这个接口
  //   Authorization: `Bearer ${getToken()}` // 这个是要表明我身份的 需要我自己传入
  // },
  data: {
    target: artId
  }
})

// 文章 - 反馈 - 反馈垃圾内容
export const reportArticleAPI = ({ artId, type }) => request({
  url: '/v1_0/article/reports',
  method: 'POST',
  // headers: {
  //   Authorization: `Bearer ${getToken()}`
  // },
  data: {
    target: artId,
    type: type,
    remark: '想写就写，在逻辑页面判断，如果点击的类型是0，再给一个弹出框输入框输入其他问题，传参到这里'
  }
})

// 文章- 获取详情
export const detailAPI = ({ artId }) => request({
  url: `/v1_0/articles/${artId}`
})

// 文章 - 点赞
export const likeArticleAPI = ({ artId }) => request({
  url: '/v1_0/article/likings',
  method: 'POST',
  data: {
    target: artId
  }
})
// 文章 - 取消点赞
export const UnlikeArticleAPI = ({ artId }) => request({
  url: `/v1_0/article/likings/${artId}`,
  method: 'DELETE'
})

// 文章 - 评论列表
export const commentListAPI = ({ id, offset = null, limit = 10 }) => request({
  url: '/v1_0/comments',
  method: 'GET',
  // query 传参目的 - 在url？后面传递查询字符串
  params: { // axios 只针对params参数，如果发现键值对，值为null，会忽略此参数名和值不携带在url？后面
    type: 'a',
    source: id,
    offset,
    limit
  }

})

// 文章 - 评论 - 喜欢
export const commentLikeAPI = ({ comId }) => request({
  url: '/v1_0/comment/likings',
  method: 'POST',
  data: {
    target: comId
  }
})

// 文章 - 评论- 取消喜欢
export const commentDisLikeAPI = ({ comId }) => request({
  url: `/v1_0/comment/likings/${comId}`,
  method: 'DELETE'
})

// 文章 -评论 - 发表评论
export const commentSendAPI = ({ id, content, art_id = null }) => {
  // 换成这个写法
  // 1.axios中， data请求传参数 如果为null是不会忽略这个参数的
  // 也会把这个参数携带给后台 （只有params传参数才会忽略
  // 2.形参art_id可选参数， 如果逻辑页面是对文章评论，则不需要传递art_id，只有对评论回复时才需要art_id
  // 所以这时 ， 内部art_id值为null 就证明此次调用， 是针对文章评论

  // data请求体对象需要自己处理
  const obj = {
    target: id,
    content
  }
  if (art_id !== null) { // 如果还有第三个参数，证明是对评论进行回复
    obj.art_id = art_id
  }
  return request({
    url: '/v1_0/comments',
    method: 'POST',
    data: obj
  })
}

// 搜索 - 联想菜单
// ({ keywords })  这是一个结构对象 一会调用这个接口方法时 传进来变量也是个对象
export const suggestListAPI = ({ keywords }) => request({
  url: '/v1_0/suggestion',
  // 接口文档用的是query请求参数，所以这里使用params
  params: {
    q: keywords
  }
})

// 搜索 - 搜索结果列表
// Query - 是查询字符串 -所以使用params
export const searchResultAPI = ({ page = 1, per_page = 10, q }) => request({
  url: '/v1_0/search',
  method: 'GET',
  params: {
    page,
    per_page,
    q
  }
})

//
