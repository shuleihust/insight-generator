# 订阅激活指南

## 问题：支付成功但显示"需要订阅"

如果你已经在 Stripe 支付成功，但系统仍然显示需要订阅，这是因为 webhook 没有同步订阅状态到数据库。

---

## 解决方案

### 步骤 1: 执行数据库修复（首次必须）⚠️

在 Supabase Dashboard 执行此 SQL：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 复制并执行以下 SQL（**两个脚本都要执行**）：

**脚本 1: 添加唯一约束**
```sql
-- 删除重复记录
DELETE FROM subscriptions a USING subscriptions b
WHERE a.user_id = b.user_id 
  AND a.created_at < b.created_at;

-- 添加唯一约束
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
```

**脚本 2: 添加 RLS 策略**
```sql
-- 先删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以创建自己的订阅" ON subscriptions;
DROP POLICY IF EXISTS "用户可以更新自己的订阅" ON subscriptions;

-- 允许用户创建自己的订阅
CREATE POLICY "用户可以创建自己的订阅"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的订阅
CREATE POLICY "用户可以更新自己的订阅"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
```

💡 **提示**: 也可以直接执行 `supabase-schema.sql` 文件来创建完整的数据库结构（包含所有表和策略）。

### 步骤 2: 手动激活订阅

在浏览器控制台执行（推荐）：

1. 打开你的应用页面（必须已登录）
2. 按 `F12` 或 `Cmd+Option+I` 打开开发者工具
3. 切换到 **Console** 标签
4. 粘贴并执行以下代码：

**激活月卡**：
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
    alert('订阅已激活！请刷新页面');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

**激活年卡**：
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
    alert('订阅已激活！请刷新页面');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

**激活终身卡**：
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
    alert('订阅已激活！请刷新页面');
    location.reload();
  } else {
    alert('激活失败: ' + data.error);
  }
});
```

### 步骤 3: 验证

刷新页面后：
- ✅ 黄色警告应该消失
- ✅ "开始提取" 按钮应该可用
- ✅ 可以正常使用风格提取和文案生成功能

---

## 长期解决方案：配置 Webhook

为了让以后的支付自动同步，需要配置 Stripe Webhook。

### 本地开发环境

1. **安装 Stripe CLI**
```bash
brew install stripe/stripe-cli/stripe
```

2. **登录**
```bash
stripe login
```

3. **转发 Webhook**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. **复制 Webhook Secret**

终端会显示：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

5. **配置环境变量**

在 `.env` 添加：
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

6. **重启服务器**
```bash
npm run dev
```

### 生产环境

1. 在 Stripe Dashboard: **Developers** → **Webhooks** → **Add endpoint**
2. 输入端点 URL: `https://yourdomain.com/api/stripe/webhook`
3. 选择事件:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 **Signing secret** 到生产环境变量

---

## 验证订阅状态

### 方法 1: 浏览器控制台

```javascript
// 检查当前订阅状态
fetch('/api/subscriptions/check')
  .then(r => r.json())
  .then(console.log);
```

### 方法 2: Supabase Dashboard

在 SQL Editor 执行：

```sql
SELECT 
  s.*,
  u.email 
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
ORDER BY s.created_at DESC;
```

---

## 常见问题

### Q1: 激活后仍然显示需要订阅

**解决**:
1. 强制刷新浏览器 (Cmd+Shift+R 或 Ctrl+Shift+R)
2. 清除浏览器缓存
3. 检查是否正确登录

### Q2: 激活 API 返回错误

**可能原因**:
- 数据库唯一约束未添加 → 执行步骤 1
- 未登录 → 确保在应用中已登录
- RLS 策略问题 → 检查 Supabase RLS 设置

### Q3: Webhook 不工作

**检查清单**:
- [ ] Stripe CLI 正在运行
- [ ] `STRIPE_WEBHOOK_SECRET` 已配置
- [ ] 开发服务器已重启
- [ ] 查看终端日志确认 webhook 事件

---

## 快速操作清单

- [ ] 步骤 1: 在 Supabase 执行 SQL 修复
- [ ] 步骤 2: 在浏览器控制台激活订阅
- [ ] 步骤 3: 刷新页面验证
- [ ] （可选）配置 Webhook 自动同步

完成后，你就可以正常使用所有功能了！🎉

