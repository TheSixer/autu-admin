<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.thirdOrderCode" placeholder="第三方订单号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="用户ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="第三方订单号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.thirdOrderCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额（RMB）" align="center">
        <template slot-scope="{row}">
          <span>¥ {{ row.type === 'thirdPay' ? (row.amount / 100) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额（USD）" align="center">
        <template slot-scope="{row}">
          <span>$ {{ row.type !== 'thirdPay' ? (row.amount / 100) : usdRate ? (Math.floor(row.amount / usdRate.rate) / 100) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 'paying' ? '待审核' : row.status === 'success' ? '审核通过' : '已拒绝' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.type === 'thirdPay' ? '第三方支付' : row.type === 'digitalCurrency' ? '数字货币' : '国际电汇' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <template v-if="row.status === 'paying'">
            <el-button type="primary" size="mini" @click="handlePass(row.id)">
              通过审核
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleRefuse(row.id)">
              拒绝审核
            </el-button>
          </template>
          <el-tag v-else :type="row.status | statusFilter">
            {{ '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList as fetchRateList } from '@/api/rate'
import { fetchList, confirmAudit, refuseAudit } from '@/api/recharge'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        paying: 'warning',
        fail: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      rateList: null,
      total: 0,
      usdRate: null,
      listLoading: true,
      importanceOptions: [{
        label: '全部',
        value: ''
      }, {
        label: '支付中',
        value: 'paying'
      }, {
        label: '审核通过',
        value: 'success'
      }, {
        label: '审核拒绝',
        value: 'fail'
      }],
      listQuery: {
        page: 1,
        limit: 10,
        status: '',
        thirdOrderCode: ''
      }
    }
  },
  created() {
    this.getList()
    this.getRateList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(({ code, data }) => {
        this.list = data.rows
        this.total = data.total
        this.listLoading = false
      })
    },
    getRateList() {
      fetchRateList(this.listQuery).then(({ code, data }) => {
        this.rateList = data
        this.usdRate = data.find(({ currency }) => currency === 'USD')
        console.log(this.usdRate)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    async confirmPass(orderId) {
      const { code } = await confirmAudit({ orderId })
      if (!code) {
        this.$message({
          type: 'success',
          message: '审核完成!'
        })
        this.listQuery.page = 1
        this.getList()
      }
    },
    async confirmRefuse(orderId) {
      const { code } = await refuseAudit({ orderId })
      if (!code) {
        this.$message({
          type: 'success',
          message: '已拒绝!'
        })
        this.listQuery.page = 1
        this.getList()
      }
    },
    handlePass(id) {
      this.$confirm('请确认充值金额是否已经到账，此操作将通过充值审核，确认后将为用户钱包充值, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirmPass(id)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    handleRefuse(id) {
      this.$confirm('如此笔充值金额未到账，可先与用户确认情况，此操作将拒绝该订单的审核, 是否继续?', '提示', {
        confirmButtonText: '确定拒绝',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirmRefuse(id)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    }
  }
}
</script>
