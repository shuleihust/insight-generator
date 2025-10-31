# 部署检查清单

## 准备工作

### ✅ 1. 账号注册

- [ ] 注册 [Supabase](https://supabase.com) 账号
- [ ] 注册 [Stripe](https://stripe.com) 账号（使用测试模式）
- [ ] 注册 [Anthropic](https://console.anthropic.com/) 账号
- [ ] 注册 [Vercel](https://vercel.com) 账号（可选，用于部署）

### ✅ 2. Supabase 设置

- [ ] 创建新项目
- [ ] 记录项目 URL 和 anon key
- [ ] 进入 Settings -> API -> Project API keys
  - [ ] 复制 `URL` 到 `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] 复制 `anon` `public` 到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] 复制 `service_role` `secret` 到 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 进入 SQL Editor
- [ ] 执行 `supabase-schema.sql` 文件
- [ ] 验证表已创建：profiles, subscriptions, insight_functions, generated_contents

### ✅ 3. Stripe 设置

#### 3.1 获取 API Keys
- [ ] 进入 Stripe Dashboard
- [ ] 切换到 **测试模式**（左上角切换按钮）
- [ ] 进入 Developers -> API keys
  - [ ] 复制 `Publishable key` 到 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] 复制 `Secret key` 到 `STRIPE_SECRET_KEY`

#### 3.2 创建产品

**月卡**:
- [ ] Products -> Create product
- [ ] Name: 洞察生成器 - 月卡
- [ ] Pricing model: Standard pricing
- [ ] Price: $199.00
- [ ] Billing period: Monthly
- [ ] 保存后复制 Price ID (price_xxx) 到 `STRIPE_PRICE_MONTHLY`

**年卡**:
- [ ] Products -> Create product
- [ ] Name: 洞察生成器 - 年卡
- [ ] Pricing model: Standard pricing
- [ ] Price: $1999.00
- [ ] Billing period: Yearly
- [ ] 保存后复制 Price ID 到 `STRIPE_PRICE_YEARLY`

**终身**:
- [ ] Products -> Create product
- [ ] Name: 洞察生成器 - 终身
- [ ] Pricing model: Standard pricing
- [ ] Price: $3999.00
- [ ] Billing period: One time
- [ ] 保存后复制 Price ID 到 `STRIPE_PRICE_LIFETIME`

#### 3.3 配置 Webhook（本地测试）

**方法 1: 使用 Stripe CLI（推荐）**
```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
- [ ] 复制显示的 webhook signing secret 到 `STRIPE_WEBHOOK_SECRET`

**方法 2: 使用 ngrok**
```bash
# 安装 ngrok
brew install ngrok

# 启动隧道
ngrok http 3000

# 在 Stripe Dashboard 添加 webhook 端点
# URL: https://your-ngrok-url.ngrok.io/api/stripe/webhook
```

### ✅ 4. Anthropic 设置

- [ ] 登录 [Anthropic Console](https://console.anthropic.com/)
- [ ] 创建 API Key
- [ ] 复制 API Key 到 `ANTHROPIC_API_KEY`
- [ ] 确保账户有足够余额

### ✅ 5. 本地开发设置

- [ ] 克隆项目
- [ ] 安装依赖: `npm install`
- [ ] 创建 `.env` 文件
- [ ] 填写所有环境变量
- [ ] 启动开发服务器: `npm run dev`
- [ ] 访问 http://localhost:3000
- [ ] 测试注册登录功能
- [ ] 测试提取风格功能
- [ ] 测试生成文案功能
- [ ] 测试支付流程（使用测试卡）

## 生产部署

### ✅ 6. Vercel 部署

- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 配置环境变量（复制 .env 内容）
- [ ] 点击 Deploy
- [ ] 记录生产环境 URL

### ✅ 7. 配置生产环境 Webhook

- [ ] 进入 Stripe Dashboard -> Developers -> Webhooks
- [ ] Add endpoint
- [ ] URL: `https://your-domain.vercel.app/api/stripe/webhook`
- [ ] 选择事件:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] 复制 Signing secret
- [ ] 在 Vercel 更新 `STRIPE_WEBHOOK_SECRET` 环境变量
- [ ] 重新部署

### ✅ 8. 更新环境变量

- [ ] 在 Vercel 更新 `NEXT_PUBLIC_APP_URL` 为生产 URL
- [ ] 重新部署

## 测试

### ✅ 9. 功能测试

- [ ] 注册新账号
- [ ] 邮箱验证
- [ ] 登录
- [ ] 查看定价页面
- [ ] 选择月卡套餐
- [ ] 使用测试卡完成支付
  - 卡号: 4242 4242 4242 4242
  - 日期: 任意未来日期
  - CVC: 任意3位数
- [ ] 确认订阅激活
- [ ] 提取文案风格
- [ ] 生成新文案
- [ ] 查看生成历史
- [ ] 管理函数库

### ✅ 10. Webhook 测试

在 Stripe Dashboard -> Developers -> Events 中:
- [ ] 确认 webhook 事件被正确接收
- [ ] 检查每个事件的响应状态（应为 200）
- [ ] 在 Supabase 确认订阅数据已更新

## 常见错误排查

### Supabase RLS 错误
```
错误: Row level security policy violation
```
**解决**: 确保执行了完整的 SQL 脚本，包括所有 RLS 策略

### Stripe Webhook 签名错误
```
错误: Webhook signature verification failed
```
**解决**: 
1. 确认 STRIPE_WEBHOOK_SECRET 正确
2. 确认使用的是测试模式的 webhook secret
3. 本地测试时使用 Stripe CLI 或 ngrok

### Claude API 超时
```
错误: Request timed out
```
**解决**:
1. 检查 API Key 是否正确
2. 确认账户有余额
3. 检查网络连接

### 流式生成不工作
```
错误: 流式响应中断
```
**解决**:
1. 确认 Vercel 支持流式响应
2. 检查客户端是否正确处理 Server-Sent Events
3. 增加超时时间限制

## 监控

### ✅ 11. 设置监控

- [ ] Stripe Dashboard -> Logs 查看支付日志
- [ ] Supabase Dashboard -> Logs 查看数据库日志
- [ ] Vercel Dashboard -> Functions -> Logs 查看 API 日志
- [ ] Anthropic Console -> Usage 查看 API 使用量

## 安全检查

### ✅ 12. 安全配置

- [ ] 确认 `.env` 不在 git 中
- [ ] 确认 service_role_key 只在服务端使用
- [ ] 确认所有 API 都有用户认证
- [ ] 确认 Supabase RLS 策略正确
- [ ] 定期轮换 API Keys

## 完成！

✅ 所有检查项完成后，系统即可正常使用！

## 后续优化

- [ ] 添加用量限制
- [ ] 添加邮件通知
- [ ] 添加使用统计
- [ ] 优化 AI 提示词
- [ ] 添加更多风格模板
- [ ] 实现函数分享功能
