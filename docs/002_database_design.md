# 002: データベース設計とSupabase連携

## 概要
Supabase上にPostgreSQLテーブルを作成し、基本的なCRUD操作を実装

## 優先度
🔴 最高

## 見積もり時間
6時間

## Phase
Phase 1 - Week 2

## 詳細仕様

### テーブル設計

#### 1. places（場所情報）
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  category TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. recommendations（口コミ）
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  heard_from TEXT NOT NULL,
  heard_from_type TEXT NOT NULL,
  note_raw TEXT,
  note_formatted TEXT,
  tags TEXT[],
  season TEXT,
  author_name TEXT,
  author_ip_hash TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_editable_until TIMESTAMP WITH TIME ZONE
);
```

#### 3. reactions（リアクション）
```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recommendation_id, reaction_type, user_identifier)
);
```

#### 4. monthly_digests（月次要約）
```sql
CREATE TABLE monthly_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_month TEXT UNIQUE NOT NULL,
  summary TEXT,
  popular_spots JSONB,
  trending_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### インデックス設計
```sql
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_recommendations_place_id ON recommendations(place_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
CREATE INDEX idx_reactions_recommendation_id ON reactions(recommendation_id);
```

### Row Level Security (RLS)
```sql
-- places: 全員が読み取り可能、認証ユーザーのみ書き込み可能
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON places FOR SELECT USING (true);

-- recommendations: 全員が読み取り可能、作成後24時間は編集可能
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON recommendations FOR INSERT WITH CHECK (true);

-- reactions: 全員が読み取り・作成可能
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON reactions FOR INSERT WITH CHECK (true);
```

## 実装タスク

- [×] Supabaseマイグレーションファイル作成
- [×] placesテーブル作成
- [×] recommendationsテーブル作成
- [×] reactionsテーブル作成
- [×] monthly_digestsテーブル作成
- [×] インデックス作成
- [×] RLSポリシー設定
- [×] TypeScript型定義ファイル生成
  - [×] `supabase gen types typescript`実行
  - [×] `src/types/database.types.ts`に保存
- [×] Supabaseクライアント関数作成
  - [×] `src/lib/supabase/client.ts`
  - [×] `src/lib/supabase/server.ts`
- [ ] サンプルデータ投入スクリプト作成（オプション）
- [×] マイグレーション実行確認

## 関連ファイル
- `supabase/migrations/` (作成)
- `src/types/database.types.ts` (作成)
- `src/lib/supabase/client.ts` (作成)
- `src/lib/supabase/server.ts` (作成)

## 完了条件
- [×] すべてのテーブルが正常に作成されている
- [×] インデックスが適切に設定されている
- [×] RLSポリシーが動作している
- [×] TypeScript型定義が生成されている
- [×] サンプルデータでCRUD操作が確認できる

## 備考
- マイグレーションファイルは`supabase/migrations/`に保存
- 定期的に`supabase db pull`でスキーマ同期を確認
- Supabase Studioで視覚的に確認しながら作業
