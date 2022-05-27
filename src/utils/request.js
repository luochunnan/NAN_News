// 基于axios的封装网络请求
// 每个程序员的想法都不一样，封装的地方和名字都不一样，但思想相同
import theAxios from 'axios'
// import router from '@/router'
import { Notify } from 'vant'
import { getToken, removeToken, setToken } from '@/utils/token'
import { getNewTokenAPI } from '@/api'
import router from '@/router'
const axios = theAxios.create({
  baseURL: 'http://geek.itheima.net',
  timeout: 2000
})
// 添加请求拦截器
axios.interceptors.request.use(function (config) { // 在请求发送之前做一些事情
  // 在发送之前做些什么
  // 目标： 统一携带token
  // 判断本地有token再携带，判断具体api/index.js里日过没有携带Authorization， 我再添加上去
  // console.log(config)
  // 未定义的叫 undefined null是没赋予具体值
  // ?.可选链操作符， 如果前面的对象里没有length， 整个表达式原地返回undefined
  // 如果getToken() 在原地有值token字符串，才能调用length 长度
  // length > 0 判断本地是否有token
  if (getToken()?.length > 0 && config.headers.Authorization === undefined) {
    config.headers.Authorization = ` Bearer ${getToken()}`
  }

  return config
}, function (error) { // 做一些请求错误的事情
  return Promise.reject(error)
})

// 添加响应拦截器
// 本质上 这就是一个函数
axios.interceptors.response.use(function (response) {
  // 当状态码为2xx/3xx开头的进这里
  // 对响应数据做点什么
  return response
}, async function (error) {
  // 响应状态码4xx/5xx进这里
  // 对响应错误做点什么
  console.dir(error)
  // 只有401才是身份过期，才需要跳转登录
  if (error.response.status === 401) {
    // 不能用this this指的是vue的实例对象 这里并不是vue 不能调用this.$router
    // 解决方案： this.$router为了拿到router对象 ，所以可以直接将@/router下的router对象
    // this.$router.replace('./login')
    // Notify({ type: 'warning', message: '身份已过期' }) // 身份过期，应该要跳转到登录页】因为有了refresh——token 所以401 不需要直接跳回登录页，
    // 但是已经在router/index.js 配置了全局守卫， 此时我们的token 还在 路由守卫判断不能 放行
    // 因此要把token移除才能跳转
    removeToken()
    // 方式1: 强制跳转到登录页，但这种方式 用户是有感知的
    // router.replace('/login')
    // 方式2: 使用refresh_token换回洗新的token再继续实用化 js代码实现 用户无感知（效果好）
    const res = await getNewTokenAPI()
    console.log(res)
    // 打印出来的error对象里的config 里包含了刚请求失败的配置文件
    // 新的token对象回来之后

    // 1. 更新token在本地
    setToken(res.data.data.token)
    // 2. 更新新的token再请求头里
    error.config.headers.Authorization = `Bearer ${res.data.data.token}`
    // 2. 未完成这次请求，再一次发起
    // error.config 就是上次请求的配置对象
    // 结果要return回原本逻辑页面调用的地方 - 其实return回去的是一个promise对象
    return axios(error.config)
    // 虽然后台还会报一个401错误 但是其实已经在用户不知情的情况下 进行刷新成功了的
  } else if (error.response.status === 500 && error.config.url === '/v1_0/authorizations' && error.config.method === 'put') {
    // 当刷新的refresh_token 也过期了
    // removeToken() // 有路由守卫，所以需要清楚token
    localStorage.clear() // 清楚全部保存的token
    Notify({ type: 'warning', message: '身份已过期' })
    router.replace('/login')
  }
  return Promise.reject(error)
})
// export default axios
// 导出自定义函数, 参数对象解构赋值
export default ({ url, method = 'GET', params = {}, data = {}, headers = {} }) => {
  return axios({
    // 以后换库, 只需要改这里, 逻辑页面不用动, 保证代码的复用性和独立性(高内聚低耦合)
    url,
    method,
    params,
    data,
    headers
  })
}
