# 大規模施設データ一括投入ガイド

## 概要

本番運用開始前に、飯田市+下伊那郡の施設データ約5,000件を一括投入するスクリプトです。

## 機能

✅ **段階的実行** - Phase 1→2→3で安全に実行
✅ **重複排除** - place_idベースで自動重複チェック
✅ **フェイルセーフ** - 途中で止まっても再開可能
✅ **エラーログ** - 失敗した処理を記録
✅ **進捗保存** - リアルタイムで進捗を保存

## 実行前の確認

### 1. 環境変数の設定

`.env.local` に以下が設定されていることを確認：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_MAPS_SERVER_API_KEY=...  # ← 必須！
```

### 2. Google Maps API の料金確認

- **推定コスト**: 約$250-300（5,000件の場合）
- Nearby Search: $0.032/リクエスト
- Place Details: $0.017/リクエスト
- Google Cloud Console でクォータと予算を確認してください

### 3. データベースのバックアップ

既存データがある場合は、念のためバックアップを取ってください。

## 実行手順

### Phase 1: 飯田市内（目標1,000件）

```bash
# 環境変数を読み込んで実行
set -a && source .env.local && set +a && npm run bulk-import:phase1
```

**対象エリア**:
- 飯田市中心部
- 飯田市北部・南部・東部・西部

**推定実行時間**: 約1時間

### Phase 2: 下伊那郡主要エリア（目標2,000件）

```bash
set -a && source .env.local && set +a && npm run bulk-import:phase2
```

**対象エリア**:
- 阿智村
- 松川町
- 高森町
- 豊丘村
- 喬木村
- 下條村

**推定実行時間**: 約2時間

### Phase 3: 下伊那郡その他エリア（目標2,000件）

```bash
set -a && source .env.local && set +a && npm run bulk-import:phase3
```

**対象エリア**:
- 根羽村
- 売木村
- 天龍村
- 泰阜村
- 大鹿村
- 平谷村
- 阿南町

**推定実行時間**: 約2時間

## 途中で止まった場合

途中でエラーやネットワーク障害で止まった場合、以下のコマンドで再開できます：

```bash
set -a && source .env.local && set +a && npm run bulk-import:resume
```

進捗は `scripts/bulk-import-progress.json` に保存されています。

## 進捗確認

### 進捗ファイル

`scripts/bulk-import-progress.json` を確認：

```json
{
  "phase": 1,
  "currentAreaIndex": 2,
  "currentTypeIndex": 15,
  "totalProcessed": 523,
  "totalInserted": 342,
  "totalDuplicates": 181,
  "totalErrors": 0,
  "startedAt": "2025-01-31T12:00:00.000Z",
  "lastUpdatedAt": "2025-01-31T12:30:00.000Z",
  "completed": false
}
```

### エラーログ

`scripts/bulk-import-errors.json` にエラーが記録されます。

## 対象施設タイプ

以下の施設タイプを取得します（ATM・ガソリンスタンドは除外）：

- **飲食系**: restaurant, cafe, bar, bakery, meal_takeaway
- **観光系**: tourist_attraction, park, museum, art_gallery, aquarium, zoo
- **宿泊系**: lodging, hotel, campground
- **商業系**: store, supermarket, shopping_mall, convenience_store
- **サービス系**: beauty_salon, hair_care, spa, gym
- **公共施設**: library, post_office, city_hall, hospital, school
- **その他**: parking, car_repair, bank

## 実行後の処理

### 1. かな生成

全施設に対して `name_kana` を生成：

```bash
set -a && source .env.local && set +a && npm run generate-kana
```

**推定実行時間**: 約1.5時間（5,000件の場合）

### 2. データ確認

管理画面（`/admin/facilities`）でデータを確認してください。

### 3. 進捗ファイルの削除

すべてのPhaseが完了したら、進捗ファイルを削除してOKです：

```bash
rm scripts/bulk-import-progress.json
rm scripts/bulk-import-errors.json
```

## トラブルシューティング

### エラー: "API quota exceeded"

Google Maps APIのクォータを超えています。
- Google Cloud Console でクォータを確認
- 翌日に再実行、または `--resume` で続きから実行

### エラー: "Environment variables not set"

環境変数が読み込まれていません。
- `set -a && source .env.local && set +a` を実行してから再実行

### 進捗がリセットされた

`bulk-import-progress.json` が削除または破損しています。
- Phase 1から再実行してください
- 重複は自動排除されるため、データの二重登録は発生しません

### 想定より少ない件数

エリアや施設タイプによって件数が変動します。
- エラーログを確認
- 必要に応じてスクリプトのエリア設定を調整

## 注意事項

⚠️ **本番運用開始後は大規模投入を行わないでください**
⚠️ **実行中はAPIコストが発生します（約$250-300）**
⚠️ **途中で止めた場合は必ず `--resume` で再開してください**
⚠️ **Google Maps APIキーは必ずサーバー側のキーを使用してください**

## サポート

問題が発生した場合は、以下を確認してください：

1. エラーログ (`scripts/bulk-import-errors.json`)
2. 進捗ファイル (`scripts/bulk-import-progress.json`)
3. コンソール出力
