# Stripe 配置指南

## 问题诊断

如果你看到错误：
```
The `price` parameter should be the ID of a price object
```

这意味着环境变量中的 Stripe Price ID 没有正确配置。

## 配置步骤

### 1. 登录 Stripe Dashboard

访问 [Stripe Dashboard](https://dashboard.stripe.com/)

### 2. 创建产品和价格

#### 方法 A: 使用测试模式（推荐用于开发）

1. 确保右上角切换到 **"测试模式"** (Test mode)
2. 导航到 **产品** (Products) → **添加产品** (Add product)

#### 创建三个产品/价格：

**月卡**
- 产品名称: `洞察生成器 - 月卡`
- 价格: `$199.00` (或 `¥199.00`)
- 计费周期: `每月` (Monthly)
- 创建后，复制 Price ID（格式：`price_xxxxxxxxxxxxx`）

**年卡**
- 产品名称: `洞察生成器 - 年卡`
- 价格: `$1999.00` (或 `¥1999.00`)
- 计费周期: `每年` (Yearly)
- 创建后，复制 Price ID

**终身卡**
- 产品名称: `洞察生成器 - 终身卡`
- 价格: `$3999.00` (或 `¥3999.00`)
- 计费周期: `一次性` (One-time)
- 创建后，复制 Price ID

### 3. 配置环境变量

在你的 `.env` 文件中添加：

```bash
# Stripe Keys (测试模式)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Price IDs (从上面创建的产品中复制)
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_LIFETIME=price_xxxxxxxxxxxxx

# Stripe Webhook Secret (稍后配置)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4. 获取 API Keys

1. 在 Stripe Dashboard，导航到 **开发者** (Developers) → **API 密钥** (API keys)
2. 复制：
   - **可发布密钥** (Publishable key) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **密钥** (Secret key) → `STRIPE_SECRET_KEY`

⚠️ **注意**: 测试模式的 key 以 `pk_test_` 和 `sk_test_` 开头

### 5. 验证配置

启动开发服务器并尝试订阅，查看控制台输出：

```bash
npm run dev
```

如果配置正确，你应该看到：
```
创建 Checkout Session: {
  planType: 'monthly',
  priceId: 'price_xxxxxxxxxxxxx',
  mode: 'subscription',
  customer: 'cus_xxxxxxxxxxxxx'
}
Checkout Session 创建成功: cs_test_xxxxxxxxxxxxx
```

## 测试支付

### 使用 Stripe 测试卡

在测试模式下，使用以下测试卡号：

**成功支付**:
- 卡号: `4242 4242 4242 4242`
- 有效期: 任何未来日期
- CVC: 任何 3 位数字
- 邮编: 任何邮编

**需要验证**:
- 卡号: `4000 0025 0000 3155`

**支付失败**:
- 卡号: `4000 0000 0000 9995`

更多测试卡: https://stripe.com/docs/testing

## Webhook 配置（可选，用于生产环境）

### 本地测试 Webhook

1. 安装 Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. 登录:
```bash
stripe login
```

3. 转发 webhook 到本地:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. 复制显示的 webhook secret (以 `whsec_` 开头)

5. 添加到 `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 生产环境 Webhook

1. 在 Stripe Dashboard: **开发者** → **Webhooks** → **添加端点**
2. 端点 URL: `https://yourdomain.com/api/stripe/webhook`
3. 选择事件:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 **签名密钥** 到生产环境变量

## 常见问题

### Q: Price ID 格式错误

**错误**: `invalid_request_error`

**原因**: 环境变量中的值不是有效的 Price ID

**解决**: 确保 Price ID 格式为 `price_xxxxxxxxxxxxx`

### Q: 找不到 Price ID

**错误**: `No such price: 'undefined'`

**原因**: 环境变量未设置

**解决**: 
1. 检查 `.env` 是否存在
2. 重启开发服务器 `npm run dev`

### Q: 支付成功但订阅未激活

**原因**: Webhook 未配置

**解决**: 按照上面的步骤配置 webhook

## 生产环境部署

切换到生产模式前：

1. ✅ 在 Stripe Dashboard 切换到 **"生产模式"**
2. ✅ 重新创建产品和价格（生产环境）
3. ✅ 更新生产环境变量（使用 `pk_live_` 和 `sk_live_` 开头的 keys）
4. ✅ 配置生产环境 webhook
5. ✅ 测试完整支付流程

## 检查清单

- [ ] Stripe 账户已创建
- [ ] 测试模式已启用
- [ ] 三个产品/价格已创建
- [ ] Price IDs 已复制到 `.env`
- [ ] API Keys 已配置
- [ ] 开发服务器已重启
- [ ] 支付流程已测试
- [ ] Webhook 已配置（可选）

## 相关文档

- [Stripe Checkout 文档](https://stripe.com/docs/payments/checkout)
- [Stripe 价格文档](https://stripe.com/docs/billing/prices-guide)
- [Stripe 测试文档](https://stripe.com/docs/testing)
- [Stripe Webhook 文档](https://stripe.com/docs/webhooks)

