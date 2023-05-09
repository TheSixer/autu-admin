import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/idcard/list',
    method: 'get',
    params: query
  })
}

export function confirmAudit(data) {
  return request({
    url: '/admin/idcard/pass',
    method: 'post',
    data
  })
}

export function refuseAudit(data) {
  return request({
    url: '/admin/idcard/refuse',
    method: 'post',
    data
  })
}
