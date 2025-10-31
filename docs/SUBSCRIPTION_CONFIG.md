# 订阅检查配置说明

## 概述

系统使用环境变量 `SKIP_SUBSCRIPTION_CHECK` 来控制是否跳过订阅状态检查。

## 环境变量

### `SKIP_SUBSCRIPTION_CHECK`

- **类型**: `string` (布尔值)
- **可选值**: `'true'` 或不设置/其他值
- **默认行为**: 不设置时，系统会检查订阅状态

## 使用场景

### 开发环境

在开发和测试时，可以跳过订阅检查以便快速测试功能：

```bash
# .env
SKIP_SUBSCRIPTION_CHECK=true
```

设置后，用户无需订阅即可使用：
- 风格提取功能 (`/extract`)
- 文案生成功能 (`/generate`)

### 生产环境

⚠️ **重要**: 生产环境必须启用订阅检查！

```bash
# .env.production 或不设置
SKIP_SUBSCRIPTION_CHECK=false
# 或者干脆不设置这个变量
```

## 影响的功能

当 `SKIP_SUBSCRIPTION_CHECK=true` 时，以下检查会被跳过：

1. **风格提取页面** (`app/(dashboard)/generate/page.tsx`)
   - 用户可以访问生成功能，即使没有有效订阅

2. **风格提取 API** (`app/api/extract/route.ts`)
   - API 不会检查订阅状态
   - 所有认证用户都可以调用

3. **文案生成 API** (`app/api/generate/route.ts`)
   - API 不会检查订阅状态
   - 所有认证用户都可以调用

## 安全提醒

- ✅ 开发环境：设置 `SKIP_SUBSCRIPTION_CHECK=true`
- ❌ 生产环境：**务必不要设置或设置为 false**
- ✅ 通过环境变量配置，不在代码中硬编码
- ✅ 在部署前检查生产环境配置

## 如何启用订阅检查

### 方法 1: 删除环境变量

从 `.env` 或 `.env.production` 中删除或注释掉：

```bash
# SKIP_SUBSCRIPTION_CHECK=true
```

### 方法 2: 设置为 false

显式设置为 false：

```bash
SKIP_SUBSCRIPTION_CHECK=false
```

### 方法 3: 设置为任何非 'true' 的值

```bash
SKIP_SUBSCRIPTION_CHECK=no
SKIP_SUBSCRIPTION_CHECK=0
SKIP_SUBSCRIPTION_CHECK=
```

## 测试订阅流程

如果你想在本地测试完整的订阅流程：

1. 删除或注释 `.env` 中的 `SKIP_SUBSCRIPTION_CHECK=true`
2. 重启开发服务器 `npm run dev`
3. 访问 `/extract` 或 `/generate`，应该会看到"需要订阅"提示
4. 配置 Stripe 测试环境并完成支付流程
5. 验证订阅后可以正常使用功能

## 检查当前配置

你可以通过以下方式检查当前是否跳过订阅检查：

1. 尝试访问 `/generate` 页面
2. 如果没有订阅但能正常使用 → `SKIP_SUBSCRIPTION_CHECK=true`
3. 如果显示"需要订阅"提示 → 订阅检查已启用

## 相关文件

- `app/(dashboard)/generate/page.tsx` - 生成页面订阅检查
- `app/api/extract/route.ts` - 提取 API 订阅检查
- `app/api/generate/route.ts` - 生成 API 订阅检查
- `env.example` - 环境变量示例文件
- `docs/SUBSCRIPTION_CONFIG.md` - 本文档

