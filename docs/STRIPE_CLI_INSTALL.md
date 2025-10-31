# Stripe CLI 安装指南

## 问题：Homebrew 安装失败

如果遇到以下错误：
```
Error: stripe: Failed to download resource "stripe"
Download failed: https://github.com/stripe/stripe-cli/releases/download/v1.32.0/stripe_1.32.0_mac-os_arm64.tar.gz
```

这通常是网络问题导致的。以下是几种解决方案：

---

## 方案 1: 重试 Homebrew 安装（推荐）

```bash
# 重试安装
brew install stripe/stripe-cli/stripe
```

如果还是失败，继续尝试方案 2 或 3。

---

## 方案 2: 手动下载安装（适合网络不稳定）

### 步骤 1: 下载

访问 [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases) 手动下载：

**macOS (Apple Silicon - M1/M2/M3)**:
```
stripe_1.32.0_mac-os_arm64.tar.gz
```

**macOS (Intel)**:
```
stripe_1.32.0_mac-os_x86_64.tar.gz
```

### 步骤 2: 解压和安装

```bash
# 进入下载目录
cd ~/Downloads

# 解压
tar -xvf stripe_*.tar.gz

# 移动到可执行路径
sudo mv stripe /usr/local/bin/

# 验证安装
stripe --version
```

---

## 方案 3: 使用 npm 安装（最简单）

```bash
# 全局安装
npm install -g stripe

# 验证安装
stripe --version
```

---

## 方案 4: 暂时跳过 Webhook 配置

如果你只是想测试支付功能，可以暂时不配置本地 Webhook：

1. **支付功能仍然可用** - 用户可以完成支付
2. **手动激活订阅** - 使用我们提供的激活 API
3. **生产环境配置** - 在 Stripe Dashboard 配置线上 Webhook

### 手动激活订阅（临时方案）

支付成功后，在浏览器控制台执行：

```javascript
fetch('/api/subscriptions/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planType: 'monthly' })
})
.then(r => r.json())
.then(data => {
  console.log(data);
  if (data.success) location.reload();
});
```

---

## 验证安装

无论使用哪种方法，安装完成后验证：

```bash
# 检查版本
stripe --version

# 登录 Stripe
stripe login

# 测试连接
stripe config --list
```

---

## 配置本地 Webhook（安装成功后）

```bash
# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 终端会显示 webhook secret
# 复制 whsec_xxxxx 到 .env 文件
```

在 `.env` 添加：
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 推荐流程

### 开发环境（推荐方案 3 或 4）

1. 使用 npm 安装 Stripe CLI（方案 3）
2. 或者暂时跳过，使用手动激活（方案 4）

### 生产环境

- 不需要 Stripe CLI
- 在 Stripe Dashboard 配置 Webhook
- 参考 `docs/STRIPE_SETUP.md` 的生产环境配置部分

---

## 常见问题

### Q: 为什么 Homebrew 下载失败？

**原因**:
- GitHub Release 下载速度慢
- 网络不稳定
- 代理配置问题

**解决**: 使用方案 2 (手动下载) 或方案 3 (npm 安装)

### Q: 不安装 Stripe CLI 可以吗？

**可以！** 你仍然可以：
- ✅ 测试支付流程（Stripe Checkout）
- ✅ 手动激活订阅
- ✅ 在生产环境配置 Webhook

**但你不能**:
- ❌ 在本地自动同步支付事件

### Q: npm 安装的 Stripe CLI 和 Homebrew 版本有区别吗？

**没有区别**，功能完全一样。npm 版本可能更新更快。

---

## 相关文档

- **docs/STRIPE_SETUP.md** - Stripe 完整配置指南
- **docs/SUBSCRIPTION_ACTIVATION.md** - 订阅激活指南（包含手动激活）


