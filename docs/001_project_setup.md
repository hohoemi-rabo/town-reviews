# 001: プロジェクトセットアップ

## 概要
Next.js 15 + Supabase + TypeScriptの基本環境構築とプロジェクト初期設定

## 優先度
🔴 最高

## 見積もり時間
4時間

## Phase
Phase 1 - Week 1

## 詳細仕様

### 技術スタック
- Next.js 15.5.6
- React 19.1.0
- TypeScript 5.x
- Tailwind CSS 3.4.17
- Supabase (PostgreSQL + Storage)
- Google Maps JavaScript API
- OpenAI API (GPT-4o-mini)

### 環境変数設定
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
OPENAI_API_KEY=
```

## 実装タスク

- [×] Next.jsプロジェクトの基本構造確認
- [×] Supabaseプロジェクト作成
- [×] 環境変数設定ファイル作成（.env.local）
- [×] Supabaseクライアント初期化コード作成
- [ ] Google Maps API有効化とAPIキー取得
- [ ] OpenAI APIキー取得
- [×] 基本的なフォルダ構造作成
  - [×] `/src/lib` - ユーティリティ関数
  - [×] `/src/components` - 再利用可能コンポーネント
  - [×] `/src/app/api` - APIルート
  - [×] `/src/types` - TypeScript型定義
- [×] ESLint・Prettier設定（デフォルト設定使用）
- [×] Git設定（.gitignoreに.env.local追加済み確認）
- [×] README更新（セットアップ手順記載）

## 関連ファイル
- `package.json`
- `.env.local` (作成)
- `src/lib/supabase.ts` (作成)
- `src/lib/google-maps.ts` (作成)
- `src/types/index.ts` (作成)
- `.gitignore`
- `README.md`

## 完了条件
- [×] すべての環境変数が設定されている
- [×] `npm run dev`でエラーなく起動する
- [×] Supabaseとの接続確認ができている
- [×] Google Maps APIの動作確認ができている

## 備考
- `.mcp.json`はすでに`.gitignore`に追加済み
- セキュリティ上の理由から、すべてのAPIキーは環境変数で管理
