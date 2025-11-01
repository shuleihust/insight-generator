# Supabase 密钥获取指南

本指南将帮助您从 Supabase 获取所需的 API 密钥。

## 📋 所需的密钥

您的应用需要以下三个 Supabase 密钥：

1. **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
2. **Anon Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) - 公开密钥，用于客户端
3. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) - 服务端密钥，具有管理员权限

## 🔍 获取步骤

### 步骤 1: 登录 Supabase 控制台

访问 [https://supabase.com/dashboard](https://supabase.com/dashboard) 并登录您的账号。

### 步骤 2: 选择项目

在项目列表中点击您的项目名称。

### 步骤 3: 进入 API 设置

1. 点击左侧边栏的 **⚙️ Settings**（设置）
2. 点击 **API** 菜单项

### 步骤 4: 查找和复制密钥

在 **Project API keys** 部分，您会看到：

#### 📌 Project URL
```
https://your-project-ref.supabase.co
```
- 复制此 URL 到 `NEXT_PUBLIC_SUPABASE_URL`

#### 🔑 anon / public
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- 这是 **Anon Key**
- 点击 👁️ 图标显示完整密钥
- 点击 📋 图标复制
- 粘贴到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 🔐 service_role / secret
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- 这是 **Service Role Key** ⚠️
- 点击 👁️ 图标显示完整密钥
- 点击 📋 图标复制
- 粘贴到 `SUPABASE_SERVICE_ROLE_KEY`

## 📝 配置环境变量

### 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ 重要提示

**Service Role Key 安全注意事项：**

1. ❌ **永远不要**将 Service Role Key 暴露在客户端代码中
2. ❌ **永远不要**提交 `.env.local` 到 Git 仓库
3. ✅ **只在服务器端代码**中使用（API routes、Server Components、Webhooks）
4. ✅ **确保** `.env.local` 已添加到 `.gitignore`

**为什么 Service Role Key 很重要？**

Service Role Key 具有**绕过所有 RLS（Row Level Security）策略**的完全访问权限，相当于数据库的管理员账号。如果泄露，攻击者可以：
- 读取所有用户数据
- 修改或删除任何数据
- 创建新数据

## 🧪 验证配置

配置完成后，运行验证脚本检查是否正确：

```bash
# 方式 1: 使用 npm 脚本（需要安装 ts-node）
npm install -D ts-node
npm run verify-supabase

# 方式 2: 手动启动开发服务器并检查日志
npm run dev
```

如果配置正确，您应该能够：
- ✅ 启动开发服务器无错误
- ✅ 访问数据库
- ✅ Stripe webhook 正常工作

## 🐛 常见问题

### Q1: "Invalid API key" 错误

**原因：** Service Role Key 不正确或未设置

**解决方案：**
1. 检查 `.env.local` 文件中的 `SUPABASE_SERVICE_ROLE_KEY`
2. 确保复制的是 `service_role` 而不是 `anon` key
3. 检查是否有多余的空格或换行符
4. 重新从 Supabase 控制台复制

### Q2: "Missing Supabase environment variables" 错误

**原因：** 环境变量未加载

**解决方案：**
1. 确认 `.env.local` 文件在项目根目录
2. 重启开发服务器
3. 检查文件名是否正确（不是 `.env` 而是 `.env.local`）

### Q3: Webhook 错误 "Invalid time value"

**原因：** 已修复 ✅

这个错误已通过添加时间戳验证解决。

### Q4: 如何在生产环境配置？

**Vercel 部署：**
1. 进入项目的 Settings > Environment Variables
2. 添加相同的环境变量
3. 确保选择 "Production" 环境

**其他平台：**
根据平台文档配置环境变量，确保包含所有 Supabase 相关变量。

## 📚 参考资源

- [Supabase API 文档](https://supabase.com/docs/guides/api)
- [Supabase 安全最佳实践](https://supabase.com/docs/guides/api/securing-your-api)
- [Next.js 环境变量](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

## 🆘 需要帮助？

如果遇到其他问题，请：
1. 检查 Supabase 控制台的日志
2. 查看浏览器开发者工具的 Network 标签
3. 检查服务器日志（`npm run dev` 的输出）

