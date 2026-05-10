# 💰 BCoin - 加密货币投资记录系统

个人投资记录 + 可视化看板，用于追踪你的加密货币投资。

## 📊 功能

- ✅ 手动记录定投交易
- ✅ 实时折线图展示资产变化
- ✅ 饼图展示资产分布
- ✅ 自动计算盈亏和收益率
- ✅ 交易记录表管理
- ✅ 快速添加按钮

## 🛠️ 技术栈

### 后端
- **Node.js** - 服务器运行时
- **Express** - Web框架
- **SQLite** - 轻量级数据库
- **CORS** - 跨域支持

### 前端
- **Vue 3** - 进阶UI框架
- **Vite** - 快速开发工具
- **ECharts** - 数据可视化
- **Axios** - HTTP请求库

## 📁 项目结构

```
BCoin/
├── backend/
│   ├── server.js              # Express API服务器
│   ├── package.json           # 后端依赖配置
│   └── db.sqlite              # SQLite数据库(本地)
│
├── frontend/
│   ├── src/
│   │   ├── App.vue            # 主组件
│   │   └── main.js            # Vue入口
│   ├── index.html             # HTML入口
│   ├── vite.config.js         # Vite配置
│   └── package.json           # 前端依赖配置
│
├── .gitignore                 # Git忽略文件
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 前置条件
- Node.js (v14+)
- npm 或 yarn
- Git

### 第一步：克隆项目

```bash
git clone https://github.com/Birdxuan/BCoin.git
cd BCoin
```

### 第二步：启动后端

```bash
cd backend
npm install
npm start
```

✅ 后端将在 `http://localhost:3000` 运行

**API文档：**
- `GET /api/trades` - 获取所有交易
- `POST /api/trade` - 添加交易
- `DELETE /api/trade/:id` - 删除交易
- `GET /api/stats` - 获取统计数据

### 第三步：启动前端

在新终端中：

```bash
cd frontend
npm install
npm run dev
```

✅ 前端将在 `http://localhost:5173` 运行

## 📖 使用说明

### 记录交易

1. **手动输入法**
   - 选择币种 (BTC/ETH/SOL/USDT)
   - 输入数量
   - 输入价格
   - 点击"记录交易"

2. **快速添加法**
   - 直接点击快速按钮："+100 USDT BTC"

### 查看数据

- 📊 **统计卡片**：显示总投入、当前资产、盈亏、收益率
- 📈 **折线图**：资产随时间的变化趋势
- 🥧 **饼图**：各币种资产占比
- 📋 **交易表**：详细的交易记录

## 🔄 多电脑同步（Git工作流）

### 电脑A (公司/办公地)

开发完成后提交：
```bash
git add .
git commit -m "新增功能描述"
git push origin main
```

### 电脑B (家里)

同步代码：
```bash
git pull origin main
```

### ⚠️ 重要

**不要同步数据库文件！**

- ❌ 不要上传 `db.sqlite`
- ✅ 每台电脑保留自己的本地数据库
- ✅ 代码、配置通过 Git 同步
- ✅ 数据库由 `.gitignore` 管理

## 📈 下一阶段升级

### 第二阶段
- [ ] 接入币安实时价格 API
- [ ] 自动计算当前市值
- [ ] 精确的盈亏计算

### 第三阶段
- [ ] 用户登录系统
- [ ] 云端数据同步
- [ ] 多币种高级分析

### 第四阶段
- [ ] Docker 部署
- [ ] 服务器部署 (Linux)
- [ ] PM2 + Nginx 生产环境

## 🐛 故障排除

### 后端启动失败

```bash
# 检查Node版本
node -v

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 清理��口
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### 前端无法连接API

```bash
# 确保后端正在运行
# 检查 vite.config.js 中的代理设置
# 确保后端启用了 CORS
```

### 数据库错误

```bash
# 删除本地数据库，重新创建
rm backend/db.sqlite
npm start  # 自动创建新数据库
```

## 💾 数据备份

```bash
# 备份本地数据
cp backend/db.sqlite backend/db.sqlite.backup

# 从备份恢复
cp backend/db.sqlite.backup backend/db.sqlite
```

## 📝 环境变量配置 (未来用)

创建 `.env` 文件：
```
PORT=3000
NODE_ENV=development
BINANCE_API_KEY=your_key_here
```

## 🤝 贡献

这是个人项目，欢迎改进！

## 📄 许可证

MIT

---


🚀 现在就可以运行！(3步快速开始)
步骤1️⃣：克隆项目到本地
bash
# 电脑A (办公)
git clone https://github.com/Birdxuan/BCoin.git
cd BCoin
步骤2️⃣：启动后端 (终端1)
bash
cd backend
npm install
npm start
✅ 看到这个说明成功：

Code
🚀 BCoin API Server
🏢 Running on http://localhost:3000
✅ API Ready!
步骤3️⃣：启动前端 (新建终端2)
bash
cd frontend
npm install
npm run dev
✅ 看到这个说明成功：

Code
VITE v4.3.9 ready in 234 ms
➜ Local: http://localhost:5173/
🌐 打开浏览器访问
http://localhost:5173

你现在就可以：

✅ 点击 "+100 USDT BTC" 快速添加
✅ 手动输入交易信息
✅ 实时看到折线图和饼图
✅ 自动计算盈亏和收益率
✅ 删除任何交易记录



**联系方式**: Birdxuan  
**项目主页**: https://github.com/Birdxuan/BCoin  
**最后更新**: 2026-05-07
