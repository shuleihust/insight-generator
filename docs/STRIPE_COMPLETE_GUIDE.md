# Stripe 完整配置指南

本指南涵盖了从 Stripe 账号设置到生产环境部署的完整流程。

## 📋 目录

1. [概述](#概述)
2. [前置准备](#前置准备)
3. [Stripe 账号配置](#stripe-账号配置)
4. [环境变量配置](#环境变量配置)
5. [测试支付流程](#测试支付流程)
6. [Webhook 配置](#webhook-配置)
7. [订阅激活](#订阅激活)
8. [开发环境配置](#开发环境配置)
9. [生产环境部署](#生产环境部署)
10. [常见问题](#常见问题)

---

## 概述

本应用使用 Stripe 处理订阅支付，支持三种订阅类型：
- 💳 **月卡** - 按月订阅
- 📅 **年卡** - 按年订阅
- 🌟 **终身卡** - 一次性支付

### 工作流程

```
用户选择套餐 → Stripe Checkout → 支付成功 → Webhook 通知 → 数据库更新 → 订阅激活
```

---

## 前置准备

### 必需账号

1. ✅ **Stripe 账号** - [注册](https://dashboard.stripe.com/register)
2. ✅ **Supabase 项目** - 参考 `docs/SUPABASE_KEYS_GUIDE.md`

### 开发工具

- Node.js 18+
- npm 或 yarn
- Stripe CLI（可选，用于本地 webhook 测试）

---

## Stripe 账号配置

### 步骤 1: 切换到测试模式

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 确保右上角切换到 **"测试模式"** (Test mode) 🔧

### 步骤 2: 获取 API 密钥

1. 导航到 **开发者** (Developers) → **API 密钥** (API keys)
2. 复制以下密钥：
   - **可发布密钥** (Publishable key) - 以 `pk_test_` 开头
   - **密钥** (Secret key) - 以 `sk_test_` 开头

⚠️ **注意**: 请妥善保管 Secret key，切勿公开或提交到代码仓库

### 步骤 3: 创建产品和价格

导航到 **产品** (Products) → **添加产品** (Add product)

#### 产品 1: 月卡

```yaml
产品名称: 洞察生成器 - 月卡
描述: 每月订阅，可随时取消
价格: ¥199.00 (或 $19.99)
计费周期: 每月 (Monthly)
计费方式: Recurring
```

创建后，复制 **Price ID**（格式：`price_xxxxxxxxxxxxx`）

#### 产品 2: 年卡

```yaml
产品名称: 洞察生成器 - 年卡
描述: 年度订阅，节省更多
价格: ¥1999.00 (或 $199.99)
计费周期: 每年 (Yearly)
计费方式: Recurring
```

创建后，复制 **Price ID**

#### 产品 3: 终身卡

```yaml
产品名称: 洞察生成器 - 终身卡
描述: 一次购买，终身使用
价格: ¥3999.00 (或 $399.99)
计费周期: 一次性 (One-time)
计费方式: One-time
```

创建后，复制 **Price ID**

---

## 环境变量配置

### 创建 `.env.local` 文件

在项目根目录创建或编辑 `.env.local` 文件：

```bash
# ==========================================
# Supabase 配置
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==========================================
# Stripe 配置（测试模式）
# ==========================================
# API 密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# 产品 Price IDs（从上面创建的产品中复制）
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_LIFETIME=price_xxxxxxxxxxxxx

# Webhook Secret（稍后配置）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ==========================================
# AI 配置
# ==========================================
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# ==========================================
# 应用配置
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 开发环境：跳过订阅检查（生产环境必须删除或设置为 false）
SKIP_SUBSCRIPTION_CHECK=true
```

### 验证配置

```bash
# 重启开发服务器
npm run dev
```

访问 `http://localhost:3000/pricing` 尝试订阅流程。

---

## 测试支付流程

### Stripe 测试卡

在测试模式下使用以下测试卡号：

#### ✅ 支付成功

```
卡号: 4242 4242 4242 4242
有效期: 任何未来日期（如 12/34）
CVC: 任何 3 位数字（如 123）
邮编: 任何邮编（如 12345）
```

#### 🔐 需要 3D 验证

```
卡号: 4000 0025 0000 3155
验证: 点击 "Complete authentication" 按钮
```

#### ❌ 支付失败

```
卡号: 4000 0000 0000 9995
结果: 模拟支付失败
```

更多测试卡: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

### 测试流程

1. 访问 `/pricing` 页面
2. 点击任一套餐的 "立即订阅" 按钮
3. 在 Stripe Checkout 页面输入测试卡信息
4. 完成支付
5. 等待重定向回应用

---

## Webhook 配置

Webhook 用于在支付成功后自动同步订阅状态到数据库。

### 为什么需要 Webhook？

没有 Webhook，订阅状态无法自动同步，用户支付后仍会显示"需要订阅"。

### 本地开发环境

#### 方法 1: 使用 npm 安装 Stripe CLI（推荐）

```bash
# 安装
npm install -g stripe

# 验证安装
stripe --version

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 方法 2: 使用 Homebrew 安装

```bash
# 安装
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 方法 3: 手动下载安装

如果上述方法失败（网络问题），可以手动下载：

1. 访问 [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases)
2. 下载适合您系统的版本：
   - macOS (Apple Silicon): `stripe_*_mac-os_arm64.tar.gz`
   - macOS (Intel): `stripe_*_mac-os_x86_64.tar.gz`
   - Windows: `stripe_*_windows_x86_64.zip`
   - Linux: `stripe_*_linux_x86_64.tar.gz`
3. 解压并移动到系统路径：

```bash
# macOS/Linux
cd ~/Downloads
tar -xvf stripe_*.tar.gz
sudo mv stripe /usr/local/bin/
stripe --version
```

#### 配置 Webhook Secret

运行 `stripe listen` 后，终端会显示：

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

复制 `whsec_` 开头的密钥，添加到 `.env.local`：

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

#### 测试 Webhook

保持 `stripe listen` 运行，在另一个终端执行支付测试。你应该看到：

```
Received Stripe webhook: checkout.session.completed
Subscription created/updated for user: xxx-xxx-xxx
```

### 方法 4: 临时跳过 Webhook（不推荐）

如果无法安装 Stripe CLI，可以临时跳过 webhook，使用手动激活：

1. 在 `.env.local` 中不设置 `STRIPE_WEBHOOK_SECRET`
2. 支付成功后，手动执行激活脚本（见下文"订阅激活"部分）

---

## 订阅激活

### 自动激活（推荐）

如果已配置 Webhook，订阅会在支付成功后自动激活。

### 手动激活（临时方案）

如果 Webhook 未配置或未工作，需要手动激活订阅。

#### 前置条件：修复数据库

⚠️ **首次必须执行**

登录 [Supabase Dashboard](https://supabase.com/dashboard)：

1. 选择你的项目
2. 点击 **SQL Editor**
3. 执行以下 SQL：

**脚本 1: 添加唯一约束**

```sql
-- 删除重复记录（如果有）
DELETE FROM subscriptions a USING subscriptions b
WHERE a.user_id = b.user_id 
  AND a.created_at < b.created_at;

-- 添加唯一约束
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
```

**脚本 2: 添加 RLS 策略**

```sql
-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "用户可以创建自己的订阅" ON subscriptions;
DROP POLICY IF EXISTS "用户可以更新自己的订阅" ON subscriptions;

-- 创建新策略
CREATE POLICY "用户可以创建自己的订阅"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的订阅"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
```

💡 **提示**: 也可以直接执行项目根目录的 `supabase-schema.sql` 文件来创建完整的数据库结构。

#### 执行激活

支付成功后，在浏览器开发者工具的 Console 中执行：

**激活月卡**

```javascript
fetch('/api/subscriptions/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planType: 'monthly' })
})
.then(r => r.json())
.then(data => {
  console.log('激活结果:', data);
  if (data.success) {
    alert('订阅已激活！');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

**激活年卡**

```javascript
fetch('/api/subscriptions/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planType: 'yearly' })
})
.then(r => r.json())
.then(data => {
  console.log('激活结果:', data);
  if (data.success) {
    alert('订阅已激活！');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

**激活终身卡**

```javascript
fetch('/api/subscriptions/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planType: 'lifetime' })
})
.then(r => r.json())
.then(data => {
  console.log('激活结果:', data);
  if (data.success) {
    alert('订阅已激活！');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

#### 验证激活

刷新页面后：
- ✅ 订阅提示消失
- ✅ 可以正常使用风格提取和文案生成功能

---

## 开发环境配置

### 跳过订阅检查

开发时为了快速测试功能，可以跳过订阅检查：

```bash
# .env.local
SKIP_SUBSCRIPTION_CHECK=true
```

设置后，所有已登录用户都可以使用所有功能，无需订阅。

### 测试完整订阅流程

如果需要测试完整的订阅流程：

1. 删除或注释 `SKIP_SUBSCRIPTION_CHECK=true`
2. 重启开发服务器
3. 访问功能页面，应该显示"需要订阅"
4. 完成支付流程
5. 验证订阅激活后可以正常使用

---

## 生产环境部署

### 前置检查清单

部署到生产环境前，确保完成：

- [ ] 数据库表结构已创建（执行 `supabase-schema.sql`）
- [ ] 数据库 RLS 策略已配置
- [ ] Stripe 账号已验证（可接收真实支付）
- [ ] 域名已配置并可访问

### 步骤 1: 切换到生产模式

1. 在 Stripe Dashboard 右上角切换到 **"生产模式"** (Live mode) ⚡
2. 获取生产环境 API 密钥：
   - Publishable key (以 `pk_live_` 开头)
   - Secret key (以 `sk_live_` 开头)

### 步骤 2: 创建生产环境产品

⚠️ **重要**: 测试模式和生产模式的数据是隔离的，需要重新创建产品。

按照"创建产品和价格"部分的步骤，在生产模式下重新创建三个产品，并获取新的 Price IDs。

### 步骤 3: 配置生产环境 Webhook

1. 在 Stripe Dashboard: **开发者** → **Webhooks** → **添加端点** (Add endpoint)
2. 输入端点 URL：
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
3. 选择要监听的事件：
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
4. 点击 **添加端点**
5. 复制 **签名密钥** (Signing secret)，以 `whsec_` 开头

### 步骤 4: 配置生产环境变量

根据你的部署平台配置环境变量：

#### Vercel 部署

1. 进入项目的 **Settings** → **Environment Variables**
2. 添加以下变量（选择 **Production** 环境）：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (生产密钥)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_LIFETIME=price_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ⚠️ 重要：不要设置 SKIP_SUBSCRIPTION_CHECK，或设置为 false
```

#### 其他平台

根据平台文档配置相同的环境变量。

### 步骤 5: 部署和测试

1. 部署应用
2. 访问 `https://yourdomain.com/pricing`
3. 使用真实信用卡测试支付（可以先支付后立即取消）
4. 验证订阅激活
5. 测试所有功能

### 步骤 6: 监控和维护

- 定期检查 Stripe Dashboard 的支付记录
- 监控 Webhook 事件日志
- 设置 Stripe 邮件通知
- 配置错误日志收集（如 Sentry）

---

## 常见问题

### Q1: 支付成功但订阅未激活

**症状**: 支付完成，但系统仍提示"需要订阅"

**原因**:
- Webhook 未配置或未工作
- 数据库 RLS 策略问题
- Service Role Key 不正确

**解决方案**:
1. 检查 Webhook 是否正确配置（`STRIPE_WEBHOOK_SECRET`）
2. 查看服务器日志中的 webhook 事件
3. 执行数据库修复 SQL（见"订阅激活"部分）
4. 使用手动激活脚本

### Q2: Price ID 错误

**错误信息**:
```
The `price` parameter should be the ID of a price object
```

**原因**: 环境变量中的 Price ID 不正确

**解决方案**:
1. 检查 `.env.local` 中的 `STRIPE_PRICE_*` 变量
2. 确保 Price ID 格式为 `price_xxxxxxxxxxxxx`
3. 在 Stripe Dashboard 确认 Price ID 存在
4. 重启开发服务器

### Q3: Webhook 签名验证失败

**错误信息**:
```
Webhook signature verification failed
```

**原因**: `STRIPE_WEBHOOK_SECRET` 不正确或已过期

**解决方案**:
1. 本地开发：重新运行 `stripe listen`，获取新的 secret
2. 生产环境：在 Stripe Dashboard 重新生成 webhook secret
3. 更新环境变量并重启应用

### Q4: Stripe CLI 安装失败

**错误信息**:
```
Error: stripe: Failed to download resource "stripe"
```

**原因**: 网络问题或 GitHub 访问受限

**解决方案**:
1. 使用 npm 安装: `npm install -g stripe`
2. 手动下载并安装（见"Webhook 配置"部分）
3. 临时使用手动激活方案

### Q5: Invalid API key 错误

**错误信息**:
```
Invalid API key
```

**原因**: 
- Stripe API key 不正确
- 使用了测试 key 但处于生产模式（或反之）

**解决方案**:
1. 检查 Stripe Dashboard 右上角的模式（测试/生产）
2. 确保使用匹配模式的 API key
3. 测试模式: `pk_test_` 和 `sk_test_`
4. 生产模式: `pk_live_` 和 `sk_live_`

### Q6: Supabase Service Role Key 错误

**错误信息**:
```
Missing Supabase environment variables
Failed to save subscription: Invalid API key
```

**原因**: `SUPABASE_SERVICE_ROLE_KEY` 未设置或不正确

**解决方案**:
参考 `docs/SUPABASE_KEYS_GUIDE.md` 获取正确的 Service Role Key

### Q7: 开发环境看不到订阅提示

**症状**: 未订阅也能使用所有功能

**原因**: `SKIP_SUBSCRIPTION_CHECK=true` 已启用

**解决方案**:
- 开发环境：这是正常的，方便测试
- 如需测试订阅流程：删除或注释该环境变量

### Q8: Date conversion 错误

**错误信息**:
```
RangeError: Invalid time value
```

**原因**: Stripe 返回的时间戳无效（已修复）

**解决方案**:
这个问题已通过添加时间戳验证解决。如果仍遇到此问题，请更新代码到最新版本。

### Q9: 重复订阅记录

**症状**: 数据库中同一用户有多条订阅记录

**原因**: 缺少唯一约束

**解决方案**:
执行数据库修复 SQL（见"订阅激活"部分的"脚本 1"）

### Q10: Webhook 事件未触发

**症状**: 支付成功但服务器日志没有 webhook 事件

**本地开发检查清单**:
- [ ] `stripe listen` 是否正在运行
- [ ] `STRIPE_WEBHOOK_SECRET` 是否已配置
- [ ] 开发服务器是否已重启
- [ ] 端口是否正确（默认 3000）

**生产环境检查清单**:
- [ ] Webhook URL 是否正确（https）
- [ ] 服务器是否可以从外网访问
- [ ] 防火墙是否阻止了 Stripe IP
- [ ] 在 Stripe Dashboard 查看 webhook 日志

---

## 验证检查清单

### 开发环境

- [ ] Stripe 测试模式已启用
- [ ] 三个产品和价格已创建
- [ ] 所有环境变量已配置
- [ ] 开发服务器可以正常启动
- [ ] 可以访问 `/pricing` 页面
- [ ] 测试支付流程成功
- [ ] Stripe CLI 和 webhook 配置完成（可选）
- [ ] 订阅激活成功
- [ ] 可以使用风格提取和文案生成功能

### 生产环境

- [ ] Stripe 生产模式已启用
- [ ] 生产环境产品和价格已创建
- [ ] 生产环境 API 密钥已配置
- [ ] 生产环境 webhook 已配置
- [ ] 数据库表结构和策略已创建
- [ ] `SKIP_SUBSCRIPTION_CHECK` 未设置或为 false
- [ ] 应用已部署并可访问
- [ ] 真实支付测试成功
- [ ] 订阅自动激活成功
- [ ] 所有功能正常工作

---

## 相关资源

### 官方文档

- [Stripe 文档](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe 测试](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### 项目文档

- `docs/SUPABASE_KEYS_GUIDE.md` - Supabase 密钥获取指南
- `docs/QUICK_START.md` - 快速开始指南
- `docs/DEPLOYMENT_CHECKLIST.md` - 部署检查清单
- `supabase-schema.sql` - 数据库表结构

---

## 获取帮助

如果遇到本文档未涵盖的问题：

1. 检查服务器日志和浏览器控制台
2. 查看 Stripe Dashboard 的事件日志
3. 查看 Supabase Dashboard 的日志
4. 参考相关文档链接
5. 在项目仓库提交 Issue

---

**最后更新**: 2025-11-01
**文档版本**: 1.0.0

