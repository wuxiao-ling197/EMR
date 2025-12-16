import request from '@/utils/request'

// 创建连接
export function initConnect() {
  return request({
    url: '/ws',
    method: 'get'
  })
}

export function wsAuthenticate(username, password) {
  const data={
    username,
    password
  }
  return request({
    url: '/livechat/authenticate',
    method: 'post',
    data: data
  })
}

// 获取用户详细信息频道
export function getChannel(query) {
  return request({
    url: '/livechat/channel',
    method: 'get',
    params: query
  })
}

export function findChannel(Id) {
  return request({
    url: '/livechat/channel/' + Id,
    method: 'get'
  })
}

// 登录方法
export function sendMsg(data) {
  return request({
    url: '/livechat/channel/message/post',
    method: 'post',
    data: data
  })
}
