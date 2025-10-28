# まち口コミ帳

地域の口コミ文化をデジタルで可視化し、「誰に教わったか」まで残す地図型レビューサービス

## 概要

南信州（飯田・下伊那）地域の住民向けに、人づての情報の連鎖を地図上に残すWebサービスです。

### 主な機能

- 📍 Google Mapsベースの地図表示
- 💬 情報源（誰から聞いたか）を含む口コミ投稿
- 😊 リアクション機能（ほっこり、行ってみたい、メモした）
- 🤖 AI機能（トーン変換、タグ自動生成）
- 📊 月次レポート自動生成

## 技術スタック

- **Frontend**: Next.js 15.5.6, React 19.1.0, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Maps**: Google Maps JavaScript API
- **AI**: OpenAI API (GPT-4o-mini)

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Admin Panel
ADMIN_PASSWORD=your_admin_password
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint
```

## プロジェクト構造

```
/src
  /app              - Next.js App Router (pages, layouts, API routes)
  /components       - 再利用可能なReactコンポーネント
  /lib              - ユーティリティ関数と共有ロジック
  /types            - TypeScript型定義
/docs               - 機能別チケットと開発ドキュメント
/supabase
  /migrations       - データベースマイグレーションファイル
```

## 開発ワークフロー

1. `/docs/README.md`でチケット一覧と優先度を確認
2. 該当チケットを開き、詳細仕様と実装タスクを確認
3. タスクを実装し、完了したら`- [×]`にマーク
4. すべての完了条件を満たしたらチケット完了

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。

## ドキュメント

- [REQUIREMENTS.md](./REQUIREMENTS.md) - 要件定義書
- [CLAUDE.md](./CLAUDE.md) - 開発ガイドライン
- [/docs](./docs) - 機能別チケット

## ライセンス

Private
