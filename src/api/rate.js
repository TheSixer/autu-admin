import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/exchange/rate/list',
    method: 'get',
    params: query
  })
}

export function createRate(data) {
  return request({
    url: '/admin/exchange/rate/save',
    method: 'post',
    data
  })
}

export function deleteRate(query) {
  return request({
    url: '/admin/exchange/rate/delete',
    method: 'get',
    params: query
  })
}
