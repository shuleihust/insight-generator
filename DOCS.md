# 项目文档索引

## 核心文档

### 快速开始
- **README.md** - 项目介绍和快速开始指南
- **env.example** - 环境变量配置示例

### 数据库
- **supabase-schema.sql** - 完整的数据库表结构和策略
  - 用户配置文件 (profiles)
  - 订阅管理 (subscriptions)
  - 风格函数 (insight_functions)
  - 生成记录 (generated_contents)

### 配置指南
- **docs/SUBSCRIPTION_CONFIG.md** - 订阅检查配置说明
  - `SKIP_SUBSCRIPTION_CHECK` 环境变量使用
  - 开发环境 vs 生产环境配置

- **docs/STRIPE_SETUP.md** - Stripe 支付配置指南
  - 创建产品和价格
  - 配置 API Keys
  - 测试支付流程
  - Webhook 配置

- **docs/SUBSCRIPTION_ACTIVATION.md** - 订阅激活指南
  - 数据库 RLS 策略修复
  - 手动激活订阅
  - Webhook 配置

## 部署文档

### 部署前准备
- **docs/DEPLOYMENT_CHECKLIST.md** - 部署检查清单
- **docs/DELIVERY_CHECKLIST.md** - 交付清单

### 快速参考
- **docs/QUICK_START.md** - 快速开始指南
- **docs/README.md** - 文档目录

## 方法论参考

位于 `docs/methodology/` 目录：

- **洞察生成器.lisp** - 谢胜子式洞察生成器 Lisp 实现
- **方法论拆解器.lisp** - 方法论拆解工具
- **洞察提炼方法论.md** - 完整的洞察提炼方法论文档

其他测试和分析文档：
- 快速提炼指令卡.md
- 提炼实战工作表.md
- 测试效果评估报告.md
- 等...

## 开发辅助

- **dev-clean.sh** - 清理开发环境脚本
- **next.config.js** - Next.js 配置（包含热重载优化）

## 文档使用建议

### 新手开始
1. README.md - 了解项目
2. env.example - 配置环境变量
3. supabase-schema.sql - 创建数据库
4. docs/SUBSCRIPTION_CONFIG.md - 配置订阅检查

### 配置支付
1. docs/STRIPE_SETUP.md - 配置 Stripe
2. docs/SUBSCRIPTION_ACTIVATION.md - 激活订阅

### 部署上线
1. docs/DEPLOYMENT_CHECKLIST.md - 检查部署项
2. docs/DELIVERY_CHECKLIST.md - 验证功能

### 方法论研究
- docs/methodology/ 目录下的所有文档

