import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/withdraw/list',
    method: 'get',
    params: query
  })
}

export function confirmAudit(data) {
  return request({
    url: '/admin/withdraw/agree',
    method: 'post',
    data
  })
}

export function refuseAudit(data) {
  return request({
    url: '/admin/withdraw/refuse',
    method: 'post',
    data
  })
}
