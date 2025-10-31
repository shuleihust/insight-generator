-- Supabase 数据库表结构
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 1. 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "用户可以查看自己的 profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的 profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. 创建 subscriptions 表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions 策略
CREATE POLICY "用户可以查看自己的订阅"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的订阅"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的订阅"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. 创建 insight_functions 表
CREATE TABLE IF NOT EXISTS insight_functions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_text TEXT NOT NULL,
  function_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE insight_functions ENABLE ROW LEVEL SECURITY;

-- Insight Functions 策略
CREATE POLICY "用户可以查看自己的函数"
  ON insight_functions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建函数"
  ON insight_functions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的函数"
  ON insight_functions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的函数"
  ON insight_functions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. 创建 generated_contents 表
CREATE TABLE IF NOT EXISTS generated_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  function_id UUID REFERENCES insight_functions(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;

-- Generated Contents 策略
CREATE POLICY "用户可以查看自己生成的内容"
  ON generated_contents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建生成记录"
  ON generated_contents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的生成记录"
  ON generated_contents FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 创建触发器：自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON insight_functions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_insight_functions_user_id ON insight_functions(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_user_id ON generated_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_function_id ON generated_contents(function_id);
