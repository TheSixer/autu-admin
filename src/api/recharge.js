import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params: query
  })
}

export function confirmAudit(data) {
  return request({
    url: '/admin/order/agree',
    method: 'post',
    data
  })
}

export function refuseAudit(data) {
  return request({
    url: '/admin/order/refuse',
    method: 'post',
    data
  })
}
