#!/bin/bash

# 开发环境清理脚本
# 用于解决样式丢失和热重载问题

echo "🧹 清理开发环境..."

# 停止正在运行的开发服务器
echo "1. 停止开发服务器..."
pkill -f "next dev" || true

# 清理 Next.js 缓存
echo "2. 清理 .next 目录..."
rm -rf .next

# 清理 node_modules/.cache
echo "3. 清理 node_modules 缓存..."
rm -rf node_modules/.cache

# 清理 TypeScript 缓存
echo "4. 清理 TypeScript 缓存..."
rm -rf .tsbuildinfo

echo "✅ 清理完成！"
echo ""
echo "现在运行: npm run dev"


