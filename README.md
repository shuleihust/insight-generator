# 洞察函数生成系统

AI 驱动的文案风格提取与生成工具,将任何文案的写作风格转化为可复用的洞察生成系统。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并填入真实值:

```bash
cp env.example .env
```

需要配置:
- **Supabase**: 数据库和认证
- **Stripe**: 支付系统
- **Anthropic**: Claude API

### 3. 设置数据库

在 Supabase Dashboard 中执行 `supabase-schema.sql` 创建数据库表。

### 4. 启动开发

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

详见 [`project-structure.md`](./project-structure.md) 了解完整的架构设计。

```
insight-generator/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # 认证页面
│   ├── (dashboard)/       # Dashboard 页面
│   ├── pricing/           # 定价页面
│   └── api/               # API 路由 ✅
├── components/            # React 组件
│   ├── ui/                # 基础 UI 组件 ✅
│   └── [业务组件]/         # 待开发
├── lib/                   # 工具库 ✅
├── types/                 # TypeScript 类型 ✅
└── hooks/                 # React Hooks ✅
```

**✅ 已完成**: API 路由、UI 组件、客户端库、类型系统  
**🔲 待开发**: 认证页面、Dashboard、业务组件

## 🎯 核心功能

### 1. 风格提取
从文案中深度分析提取:
- 核心目标与信念
- 思维模型
- 语言特征
- 创作流程

### 2. 智能生成
使用提取的风格函数,流式生成新文案。

### 3. 订阅管理
三种套餐: 月卡($199)、年卡($1999)、终身($3999)

## 🛠️ 技术栈

- **框架**: Next.js 15 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **认证**: Supabase Auth
- **数据库**: PostgreSQL (Supabase)
- **支付**: Stripe
- **AI**: Claude API (Anthropic)

## 📚 文档

### 核心文档(根目录)
- **[`开发指南.md`](./开发指南.md)** - 详细的开发指引、代码示例、最佳实践
- **[`project-structure.md`](./project-structure.md)** - 完整的架构设计和数据库设计
- **[`supabase-schema.sql`](./supabase-schema.sql)** - 数据库 SQL 脚本

### 详细文档(docs/ 目录)
- **[`docs/QUICK_START.md`](./docs/QUICK_START.md)** - 10分钟快速安装指南
- **[`docs/DEPLOYMENT_CHECKLIST.md`](./docs/DEPLOYMENT_CHECKLIST.md)** - 部署检查清单
- **[`docs/DELIVERY_CHECKLIST.md`](./docs/DELIVERY_CHECKLIST.md)** - 交付检查清单
- **`docs/methodology/`** - 业务方法论文档

💡 查看 [`docs/README.md`](./docs/README.md) 了解完整的文档结构

## 🔧 开发命令

```bash
npm run dev      # 开发模式
npm run build    # 构建项目
npm run start    # 生产模式
npm run lint     # 代码检查
```

## 📦 项目状态

✅ **基础设施完成** (2025-10-31)
- [x] 项目结构
- [x] API 路由 (5个)
- [x] UI 组件 (7个)
- [x] 客户端库 (6个)
- [x] 类型系统
- [x] 构建测试通过

🔲 **待开发功能**
- [ ] 认证系统
- [ ] Dashboard 页面
- [ ] 风格提取功能
- [ ] 文案生成功能
- [ ] 定价页面

## 🚦 开发路线

### Phase 1: 认证系统 (优先级: 高)
实现用户注册、登录、密码重置

### Phase 2: Dashboard (优先级: 高)
创建 Dashboard 布局和导航

### Phase 3: 核心功能 (优先级: 高)
- 风格提取界面
- 函数管理
- 文案生成界面

### Phase 4: 支付系统 (优先级: 中)
定价页面和 Stripe 集成

详见 [`开发指南.md`](./开发指南.md) 了解具体实现步骤。

## 📄 许可证

© 2025 洞察生成器. All rights reserved.
