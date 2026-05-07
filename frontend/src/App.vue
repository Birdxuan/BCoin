<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>💰 BCoin 投资系统</h1>
      <p>个人加密货币投资记录 & 可视化看板</p>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel: Input Form -->
      <div class="left-panel">
        <div class="card form-card">
          <h2>📝 记录交易</h2>
          
          <div class="form-group">
            <label>选择币种</label>
            <select v-model="form.coin" class="input">
              <option value="BTC">BTC - Bitcoin</option>
              <option value="ETH">ETH - Ethereum</option>
              <option value="SOL">SOL - Solana</option>
              <option value="USDT">USDT - Tether</option>
              <option value="XRP">XRP - Ripple</option>
            </select>
          </div>

          <div class="form-group">
            <label>投入金额 (USDT)</label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              placeholder="例如: 100"
              class="input"
            />
          </div>

          <div class="form-group">
            <label>购买价格 (USDT)</label>
            <input 
              v-model.number="form.price" 
              type="number" 
              placeholder="例如: 42000"
              class="input"
            />
          </div>

          <div class="form-group">
            <label>购买数量</label>
            <input 
              v-model.number="form.quantity" 
              type="number" 
              placeholder="自动计算: 金额/价格"
              class="input"
              disabled
            />
          </div>

          <button @click="addTrade" class="btn btn-primary btn-full">
            ✅ 记录交易
          </button>

          <!-- Quick Add Buttons -->
          <div class="quick-buttons">
            <h3>⚡ 快速添加</h3>
            <button @click="quickAdd('BTC', 100, 42000)" class="btn btn-secondary">+100 USDT BTC</button>
            <button @click="quickAdd('ETH', 100, 2500)" class="btn btn-secondary">+100 USDT ETH</button>
            <button @click="quickAdd('SOL', 100, 140)" class="btn btn-secondary">+100 USDT SOL</button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Charts & Stats -->
      <div class="right-panel">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">总投入</div>
            <div class="stat-value">{{ stats.totalCost.toFixed(2) }} USDT</div>
            <div class="stat-icon">📊</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">当前资产</div>
            <div class="stat-value">{{ stats.totalValue.toFixed(2) }} USDT</div>
            <div class="stat-icon">💼</div>
          </div>

          <div class="stat-card" :class="{ positive: stats.pnl >= 0, negative: stats.pnl < 0 }">
            <div class="stat-label">盈亏</div>
            <div class="stat-value">{{ stats.pnl >= 0 ? '+' : '' }}{{ stats.pnl.toFixed(2) }} USDT</div>
            <div class="stat-icon">📈</div>
          </div>

          <div class="stat-card" :class="{ positive: stats.roi >= 0, negative: stats.roi < 0 }">
            <div class="stat-label">收益率</div>
            <div class="stat-value">{{ stats.roi >= 0 ? '+' : '' }}{{ stats.roi.toFixed(2) }}%</div>
            <div class="stat-icon">🎯</div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-container">
          <div class="chart-card">
            <h3>📈 资产变化趋势</h3>
            <div ref="lineChart" class="chart"></div>
          </div>

          <div class="chart-card">
            <h3>🥧 资产分布</h3>
            <div ref="pieChart" class="chart"></div>
          </div>
        </div>

        <!-- Trades Table -->
        <div class="card">
          <h3>📋 交易记录</h3>
          <div class="table-container">
            <table class="trades-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>币种</th>
                  <th>投入 (USDT)</th>
                  <th>价格</th>
                  <th>数量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trade in trades" :key="trade.id" class="trade-row">
                  <td>{{ formatTime(trade.created_at) }}</td>
                  <td><strong>{{ trade.coin }}</strong></td>
                  <td>{{ trade.amount.toFixed(2) }}</td>
                  <td>{{ trade.price.toFixed(2) }}</td>
                  <td>{{ trade.quantity.toFixed(8) }}</td>
                  <td>
                    <button @click="deleteTrade(trade.id)" class="btn btn-danger btn-small">
                      🗑️ 删除
                    </button>
                  </td>
                </tr>
                <tr v-if="trades.length === 0" class="empty-row">
                  <td colspan="6">暂无交易记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import * as echarts from 'echarts'
import { ref, reactive, onMounted, watch } from 'vue'

const lineChart = ref(null)
const pieChart = ref(null)

const trades = ref([])
const stats = reactive({
  totalCost: 0,
  totalValue: 0,
  pnl: 0,
  roi: 0,
  byCoins: {}
})

const form = reactive({
  coin: 'BTC',
  amount: 100,
  price: 42000,
  quantity: 0
})

// Watch form changes to auto-calculate quantity
watch(
  () => [form.amount, form.price],
  () => {
    if (form.price > 0) {
      form.quantity = form.amount / form.price
    }
  }
)

const API_BASE = '/api'

// Load trades and stats
const loadData = async () => {
  try {
    const [tradesRes, statsRes] = await Promise.all([
      axios.get(`${API_BASE}/trades`),
      axios.get(`${API_BASE}/stats`)
    ])

    trades.value = tradesRes.data
    Object.assign(stats, statsRes.data)

    updateCharts()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const addTrade = async () => {
  if (!form.coin || !form.amount || !form.price) {
    alert('请填写完整信息')
    return
  }

  try {
    await axios.post(`${API_BASE}/trade`, {
      coin: form.coin,
      amount: form.amount,
      price: form.price,
      quantity: form.quantity,
      timestamp: new Date().toISOString()
    })

    // Reset form
    form.amount = 100
    form.price = 42000
    form.quantity = 0

    // Reload data
    await loadData()
  } catch (error) {
    console.error('Failed to add trade:', error)
    alert('记录失败')
  }
}

const quickAdd = async (coin, amount, price) => {
  form.coin = coin
  form.amount = amount
  form.price = price
  form.quantity = amount / price
  await addTrade()
}

const deleteTrade = async (id) => {
  if (!confirm('确认删除此交易?')) return

  try {
    await axios.delete(`${API_BASE}/trade/${id}`)
    await loadData()
  } catch (error) {
    console.error('Failed to delete trade:', error)
    alert('删除失败')
  }
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const updateCharts = () => {
  updateLineChart()
  updatePieChart()
}

const updateLineChart = () => {
  if (!lineChart.value || !trades.value.length) return

  const chart = echarts.init(lineChart.value)
  
  const cumulativeValues = []
  let cumulative = 0
  
  trades.value.reverse().forEach((trade) => {
    cumulative += trade.amount
    cumulativeValues.push(cumulative)
  })

  chart.setOption({
    responsive: true,
    title: { text: '', textStyle: { fontSize: 0 } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: trades.value.map((_, i) => `第${i + 1}笔`),
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'USDT'
    },
    series: [
      {
        data: cumulativeValues,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#667eea' },
        areaStyle: { color: 'rgba(102, 126, 234, 0.3)' }
      }
    ]
  })
}

const updatePieChart = () => {
  if (!pieChart.value || !Object.keys(stats.byCoins).length) return

  const chart = echarts.init(pieChart.value)

  const pieData = Object.entries(stats.byCoins).map(([coin, data]) => ({
    name: coin,
    value: data.totalCost
  }))

  chart.setOption({
    responsive: true,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '投入金额',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }
    ]
  })
}

onMounted(() => {
  loadData()
  // Refresh stats every 30 seconds
  setInterval(() => {
    loadData()
  }, 30000)
})
</script>

<style scoped>
.container {
  width: 100%;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.1em;
  opacity: 0.9;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-card {
  position: sticky;
  top: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-card h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  flex: 1;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff4757;
  color: white;
  font-size: 12px;
}

.btn-danger:hover {
  background: #ee5a52;
}

.btn-full {
  width: 100%;
  margin-bottom: 20px;
}

.btn-small {
  padding: 6px 10px;
  font-size: 12px;
}

.quick-buttons {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.quick-buttons h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
}

.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-card.positive {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.stat-card.negative {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
}

.stat-icon {
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 28px;
  opacity: 0.3;
}

.stat-label {
  color: #999;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin-bottom: 15px;
  color: #333;
}

.chart {
  width: 100%;
  height: 300px;
}

.table-container {
  overflow-x: auto;
}

.trades-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.trades-table thead {
  background: #f5f5f5;
}

.trades-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.trades-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.trade-row:hover {
  background: #f9f9f9;
}

.empty-row {
  text-align: center;
  color: #999;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .form-card {
    position: relative;
    top: 0;
    max-height: none;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header h1 {
    font-size: 1.8em;
  }
}
</style>
