# ⚡ 10分钟快速安装指南

## 前提条件

- ✅ Node.js 18+ 已安装
- ✅ npm 或 yarn 已安装  
- ✅ Git 已安装

## 第一步：初始化项目 (2分钟)

```bash
# 1. 创建项目目录
mkdir insight-generator
cd insight-generator

# 2. 复制所有文件到这个目录
# 将下载的所有文件放入此文件夹

# 3. 安装依赖
npm install

# 4. 复制环境变量模板
cp .env.example .env
```

## 第二步：配置 Supabase (3分钟)

### 2.1 创建项目
1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息，等待创建完成

### 2.2 获取密钥
1. 进入项目 Settings -> API
2. 复制以下内容到 `.env`：
```env
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
SUPABASE_SERVICE_ROLE_KEY=你的service_role key
```

### 2.3 创建数据库表
1. 进入 SQL Editor
2. 打开 `supabase-schema.sql` 文件
3. 复制全部内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行

## 第三步：配置 Stripe (3分钟)

### 3.1 切换到测试模式
1. 访问 https://dashboard.stripe.com
2. 确保左上角显示 "测试模式"

### 3.2 获取 API Keys
1. 进入 Developers -> API keys
2. 复制到 `.env`：
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### 3.3 创建产品（快速版）
使用 Stripe CLI（推荐）：

```bash
# 安装 Stripe CLI
npm install -g stripe

# 登录
stripe login

# 创建月卡产品
stripe prices create \
  --unit-amount=19900 \
  --currency=usd \
  --recurring[interval]=month \
  -d "product_data[name]=洞察生成器-月卡"
# 复制返回的 price_xxx 到 STRIPE_PRICE_MONTHLY

# 创建年卡产品
stripe prices create \
  --unit-amount=199900 \
  --currency=usd \
  --recurring[interval]=year \
  -d "product_data[name]=洞察生成器-年卡"
# 复制返回的 price_xxx 到 STRIPE_PRICE_YEARLY

# 创建终身产品
stripe prices create \
  --unit-amount=399900 \
  --currency=usd \
  -d "product_data[name]=洞察生成器-终身"
# 复制返回的 price_xxx 到 STRIPE_PRICE_LIFETIME
```

或者在 Dashboard 手动创建：
1. Products -> Create product
2. 填写名称和价格
3. 保存后复制 Price ID

### 3.4 配置 Webhook（本地测试）
```bash
# 启动 webhook 转发
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 复制显示的 webhook signing secret
# 添加到 .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 第四步：配置 Claude API (1分钟)

1. 访问 https://console.anthropic.com/
2. 创建 API Key
3. 添加到 `.env`：
```env
ANTHROPIC_API_KEY=sk-ant-xxx
```

## 第五步：启动项目 (1分钟)

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 完整的 .env 示例

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx
STRIPE_SECRET_KEY=sk_test_51xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Products
STRIPE_PRICE_MONTHLY=price_1xxx
STRIPE_PRICE_YEARLY=price_1xxx
STRIPE_PRICE_LIFETIME=price_1xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 快速测试

### 测试注册登录
1. 访问 http://localhost:3000
2. 点击"注册"
3. 填写邮箱密码
4. 检查邮箱验证链接（Supabase 会发送）

### 测试支付
1. 访问 http://localhost:3000/pricing
2. 选择套餐
3. 使用测试卡：
   - 卡号：4242 4242 4242 4242
   - 日期：任意未来日期
   - CVC：任意3位数
4. 完成支付

### 测试功能
1. 登录后访问 /dashboard
2. 提取风格：粘贴文案，点击提取
3. 生成文案：选择函数，输入话题，生成

## 常见问题

### ❌ Supabase 连接失败
**检查**：
- URL 和 Key 是否正确
- 是否执行了 SQL 脚本

### ❌ Stripe Webhook 错误
**检查**：
- 是否运行了 `stripe listen`
- Webhook Secret 是否正确

### ❌ Claude API 超时
**检查**：
- API Key 是否正确
- 账户是否有余额

### ❌ 流式生成不显示
**检查**：
- 浏览器是否支持 EventSource
- 网络连接是否稳定

## 下一步

✅ 系统运行后：
1. 补充前端页面（见 PROJECT_GUIDE.md）
2. 美化 UI（使用 shadcn/ui）
3. 部署到 Vercel（见 DEPLOYMENT_CHECKLIST.md）

## 需要帮助？

查看详细文档：
- `README.md` - 完整文档
- `DEPLOYMENT_CHECKLIST.md` - 部署清单
- `PROJECT_GUIDE.md` - 项目指南

祝你成功！🚀
