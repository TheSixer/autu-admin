import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/consult/list',
    method: 'get',
    params: query
  })
}
