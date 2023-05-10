<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input v-model="rate.rate" placeholder="输入汇率" style="width: 200px;" class="filter-item" />
      <el-select v-model="rate.currencyCode" placeholder="选择货币" clearable style="width: 120px;" class="filter-item">
        <el-option v-for="item in rateCode" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="saveRate">
        新增
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
      <el-table-column label="货币类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.currency }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前汇率" align="center">
        <template slot-scope="{row}">
          <span>¥ {{ row.rate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createDateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updateDateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.status != 'deleted'" :disabled="row.currency === 'USD'" size="mini" type="danger" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { fetchList, createRate, deleteRate } from '@/api/rate'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'ComplexTable',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      rate: {
        rate: '',
        currencyCode: ''
      },
      rateCode: ['USD', 'EUR', 'AUD', 'CHF', 'GBP', 'JPY', 'PLN', 'ZAR']
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList().then(({ code, data }) => {
        this.list = data
        this.listLoading = false
      })
    },
    handleFilter() {
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
    async saveRate() {
      const { code } = await createRate(this.rate)
      if (!code) {
        this.$message({
          type: 'success',
          message: '新增成功!'
        })
        this.getList()
      }
    },
    async handleDelete(id) {
      const { code } = await deleteRate({ id })
      if (!code) {
        this.$message({
          type: 'success',
          message: '已删除!'
        })
        this.getList()
      }
    }
  }
}
</script>
