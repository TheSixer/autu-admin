<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column label="ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.realName }}</span>
          <el-button
            v-clipboard:copy="row.realName"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"
            type="text"
            icon="el-icon-copy-document"
          />
        </template>

        <el-button type="info" icon="el-icon-message" circle />
      </el-table-column>
      <el-table-column label="开户银行" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bankName }}</span>
          <el-button
            v-clipboard:copy="row.bankName"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"
            type="text"
            icon="el-icon-copy-document"
          />
        </template>
      </el-table-column>
      <el-table-column label="银行卡号" width="200" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cardNum }}</span>
          <el-button
            v-clipboard:copy="row.cardNum"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"
            type="text"
            icon="el-icon-copy-document"
          />
        </template>
      </el-table-column>
      <el-table-column label="提现金额（RMB）" align="center">
        <template slot-scope="{row}">
          <span>¥ {{ row.amount / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现金额（USD）" align="center">
        <template slot-scope="{row}">
          <span>$ {{ usdRate ? (Math.floor(row.amount / usdRate.rate) / 100) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 0 ? '等待审核' : row.status === 1 ? '审核通过' : '已拒绝' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.auditTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <template v-if="row.status === 0">
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
import { fetchList, confirmAudit, refuseAudit } from '@/api/withdraw'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'warning',
        2: 'danger'
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
        label: '等待审核',
        value: 0
      }, {
        label: '审核通过',
        value: 1
      }, {
        label: '审核拒绝',
        value: 2
      }],
      listQuery: {
        page: 1,
        limit: 10,
        status: ''
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
    async confirmPass(id) {
      const { code } = await confirmAudit({ id })
      if (!code) {
        this.$message({
          type: 'success',
          message: '审核完成!'
        })
        this.listQuery.page = 1
        this.getList()
      }
    },
    async confirmRefuse(params) {
      const { code } = await refuseAudit(params)
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
      this.$confirm('请和用户确认提现金额是否已经到账，此操作将通过提现审核，是否继续?', '提示', {
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
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.confirmRefuse({ id, reason: value })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    onCopySuccess() {
      this.$message({
        type: 'success',
        message: '复制成功'
      })
    },
    onCopyError() {
      this.$message({
        type: 'error',
        message: '复制出错，请手动复制'
      })
    }
  }
}
</script>
