<template>
  <div class="app-container">

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" label="ID" width="65">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户名">
        <template slot-scope="{row}">
          <span>{{ row.userName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="审核状态">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? '审核通过' : row.status === 2 ? '审核不通过' : '审核中' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="更新时间">
        <template slot-scope="{row}">
          <span>{{ row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="查看图片">
        <template slot-scope="{row}">
          <el-image
            style="width: 100px; height: 80px"
            :src="row.photoUrl"
            :preview-src-list="[row.photoUrl]"
          />
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="{row}">
          <block v-if="!row.status">
            <el-button type="primary" size="mini" @click="handlePass(row.id)">
              通过审核
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleRefuse(row.id)">
              拒绝审核
            </el-button>
          </block>
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
import { fetchList, confirmAudit, refuseAudit } from '@/api/audits'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
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
      }
    },
    async confirmRefuse(id) {
      const { code } = await refuseAudit({ id })
      if (!code) {
        this.$message({
          type: 'success',
          message: '已拒绝!'
        })
      }
    },
    handlePass(id) {
      this.$confirm('此操作将通过账户审核, 是否继续?', '提示', {
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
      this.$confirm('此操作将拒绝账户审核, 是否继续?', '提示', {
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
