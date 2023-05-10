/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const auditsRouter = {
  path: '/audits',
  component: Layout,
  redirect: '/table/photo',
  name: 'Table',
  meta: {
    title: '审核管理',
    icon: 'table'
  },
  children: [
    {
      path: 'photo',
      component: () => import('@/views/audits/index'),
      name: 'DynamicTable',
      meta: { title: '身份认证' }
    },
    {
      path: 'recharge',
      component: () => import('@/views/recharge/index'),
      name: 'DynamicTable',
      meta: { title: '充值申请' }
    },
    {
      path: 'withdraw',
      component: () => import('@/views/withdraw/index'),
      name: 'DynamicTable',
      meta: { title: '提现申请' }
    }
  ]
}
export default auditsRouter
