# 016: 施設データベース事前登録 & 検索機能

## 概要
南信州（飯田・下伊那）の施設をデータベースに事前登録し、口コミ投稿時にキーワード検索で選択できるようにする。Google Maps URL入力方式を廃止し、高齢者でも簡単に投稿できる仕組みに変更。

## 背景・課題

### 現状の問題点
- **Google Maps URLをコピー&ペーストする操作が高齢者には困難**
  - 「共有」ボタンを押す → URLをコピー → アプリに貼り付け
  - パソコン・スマホ操作が苦手な60代以上には無理がある
  - この方式だとユーザーが離れてしまう

### 解決策
- 施設を事前にデータベース登録（500～1000件）
- キーワード検索 + サジェスト方式で簡単に選択
- 施設が見つからない場合は簡易リクエストフォーム
- Google Maps URL入力方式は完全廃止

## 目的
- 高齢者でも迷わず口コミ投稿できるUXを実現
- 南信州の主要施設を網羅的にカバー
- 施設情報の一元管理とメンテナンス性向上

## 優先度
🔴 最高（Phase 1の投稿UXを大幅改善）

## 見積もり時間
16時間

## Phase
Phase 1.5 - MVP改善（Ticket 008-009の前に実施）

## 詳細仕様

### 1. 施設データベース設計

#### 1-1. placesテーブル拡張
```sql
ALTER TABLE places ADD COLUMN IF NOT EXISTS area TEXT; -- エリア（飯田市、下條村など）
ALTER TABLE places ADD COLUMN IF NOT EXISTS google_maps_url TEXT; -- 共有URL
ALTER TABLE places ADD COLUMN IF NOT EXISTS phone TEXT; -- 電話番号（任意）
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false; -- 管理者承認済み
ALTER TABLE places ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin'; -- 作成者（admin/user/api）

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_places_area ON places(area);
CREATE INDEX IF NOT EXISTS idx_places_name_search ON places USING gin(to_tsvector('japanese', name));
```

**フィールド説明**:
- `area`: 飯田市、下條村、阿智村など（検索絞り込み用）
- `google_maps_url`: https://maps.app.goo.gl/xxxxx（「Google Mapsで開く」ボタン用）
- `phone`: 電話番号（将来的に施設詳細ページで表示）
- `is_verified`: 管理者承認済みフラグ（ユーザーリクエストとAPI取得を区別）
- `created_by`: 作成元（admin=手動登録、user=ユーザーリクエスト、api=API自動取得）

#### 1-2. 施設追加リクエストテーブル（新規作成）
```sql
CREATE TABLE facility_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_name TEXT NOT NULL,
  address TEXT, -- 任意
  area TEXT, -- 任意（ユーザーが選択）
  category TEXT, -- 任意（ユーザーが選択）
  requester_name TEXT, -- 任意（匿名可）
  requester_email TEXT, -- 任意（返信希望時）
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_note TEXT, -- 管理者メモ
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- インデックス
CREATE INDEX idx_facility_requests_status ON facility_requests(status);
```

### 2. 施設検索機能

#### 2-1. 検索API仕様
**エンドポイント**: `/api/facilities/search`

**リクエスト**:
```typescript
POST /api/facilities/search
{
  query: string,        // 検索キーワード（施設名）
  limit?: number,       // 結果件数（デフォルト: 10）
  area?: string,        // エリア絞り込み（任意）
  category?: string     // カテゴリー絞り込み（任意）
}
```

**レスポンス**:
```typescript
{
  facilities: [
    {
      id: string,
      name: string,
      address: string,
      area: string,
      category: string,
      lat: number,
      lng: number,
      google_maps_url: string | null
    }
  ]
}
```

**検索ロジック**:
- PostgreSQL全文検索（`to_tsvector('japanese', name)`）
- `ILIKE` 部分一致検索（フォールバック）
- `is_verified = true` のみ返す（ユーザーリクエスト中は除外）

#### 2-2. 検索UI（PostModal改修）

**現在のフロー（廃止）**:
```
Step 1: Google Maps URL入力
 ↓
Step 2: フォーム入力
```

**新フロー**:
```
Step 1: 施設検索 & 選択
 ↓
Step 2: フォーム入力（カテゴリー、メモなど）
```

**Step 1 UI仕様**:
```tsx
┌─────────────────────────────────────┐
│ 🔍 施設名を入力してください          │
├─────────────────────────────────────┤
│ [検索ボックス]                      │
│                                     │
│ ▼ 候補（リアルタイムサジェスト）    │
│ 📍 三河家（飯田市 - 飲食店）         │
│ 📍 Burger Cafe PAL'S（飯田市 - 飲食店）│
│ 📍 グリーングラス（下條村 - 飲食店） │
│                                     │
│ 施設が見つかりませんか？             │
│ [➕ 施設追加をリクエスト]            │
└─────────────────────────────────────┘
```

**機能詳細**:
- リアルタイムサジェスト（300msデバウンス）
- 3文字以上入力で検索開始
- 最大10件表示
- 施設選択 → Step 2へ遷移
- 「施設追加をリクエスト」→ リクエストフォームモーダル表示

### 3. 施設追加リクエスト機能

#### 3-1. リクエストフォームUI
```tsx
┌─────────────────────────────────────┐
│ 📝 施設追加リクエスト                │
├─────────────────────────────────────┤
│ 施設名 * [              ]           │
│ 住所（分かれば） [        ]         │
│ エリア [飯田市 ▼]                   │
│ カテゴリー [飲食店 ▼]               │
│                                     │
│ あなたの名前（任意） [    ]         │
│ メール（任意） [          ]         │
│                                     │
│ [リクエストを送信]                  │
└─────────────────────────────────────┘
```

**送信後の挙動**:
1. データベースに保存（`status: 'pending'`）
2. 管理者にメール通知（Resend）
3. ユーザーに確認メッセージ表示
   ```
   「リクエストを送信しました。
   管理者が確認後、施設を追加します。」
   ```
4. モーダルを閉じる（投稿は中断）

#### 3-2. メール通知仕様（Resend）

**送信先**: `rabo.hohoemi@gmail.com`

**件名**: `【まち口コミ帳】施設追加リクエスト - {施設名}`

**本文テンプレート**:
```
新しい施設追加リクエストが届きました。

━━━━━━━━━━━━━━━━━━━━
施設情報
━━━━━━━━━━━━━━━━━━━━
施設名: {facility_name}
住所: {address}
エリア: {area}
カテゴリー: {category}

━━━━━━━━━━━━━━━━━━━━
リクエスト者情報
━━━━━━━━━━━━━━━━━━━━
名前: {requester_name}
メール: {requester_email}

━━━━━━━━━━━━━━━━━━━━
管理画面で確認:
https://your-domain.com/admin/facility-requests
━━━━━━━━━━━━━━━━━━━━

このメールは自動送信されています。
```

**環境変数**:
```bash
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=rabo.hohoemi@gmail.com
```

### 4. Google Places API 一括取得機能

#### 4-1. データ取得スクリプト
**コマンド**: `npm run import-places`

**取得対象エリア**:
- 飯田市
- 下條村
- 阿智村
- 豊丘村
- 松川町
- 高森町
- 喬木村
- 大鹿村
- 売木村
- 天龍村
- 泰阜村
- 根羽村
- 平谷村
- 下條村

**取得カテゴリー**:
- restaurant（レストラン）
- cafe（カフェ）
- tourist_attraction（観光地）
- spa（温泉）
- park（公園）
- store（店舗）

**処理フロー**:
1. Google Places API Nearby Searchで各エリア × カテゴリーを検索
2. Place Details APIで詳細情報取得
3. CSV出力（`./data/places_export.csv`）
4. 管理者がレビュー・編集
5. 管理画面からCSVインポート

**CSV形式**:
```csv
name,address,area,category,lat,lng,place_id,google_maps_url,phone
三河家,長野県飯田市○○,飯田市,飲食店,35.5136,137.8261,ChIJ...,https://maps.app.goo.gl/xxxxx,0265-xx-xxxx
```

**注意点**:
- `google_maps_url`は手動で追加（APIから取得不可）
- または、`place_id`から生成: `https://www.google.com/maps/place/?q=place_id:{place_id}`

#### 4-2. 料金概算
```
Nearby Search: $0.032/件
Place Details: $0.017/件

500件の場合:
(500 × $0.032) + (500 × $0.017) = $24.50

無料枠 $200/月 → 十分余裕あり
```

### 5. 管理画面機能（CSVインポート）

#### 5-1. CSVアップロード画面
```
┌─────────────────────────────────────┐
│ 施設データ管理                       │
├─────────────────────────────────────┤
│ 📊 登録済み施設数: 523件             │
│                                     │
│ CSVファイルをアップロード            │
│ [ファイルを選択] [アップロード]     │
│                                     │
│ ⚠️ 注意事項:                        │
│ - 必須: name, area, category        │
│ - 任意: address, lat, lng, place_id │
│ - 重複チェック: name + area         │
│                                     │
│ 📥 サンプルCSVダウンロード           │
└─────────────────────────────────────┘
```

**処理フロー**:
1. CSVファイル検証（必須カラムチェック）
2. 重複チェック（`name` + `area`で判定）
3. 一括INSERT（`ON CONFLICT DO NOTHING`）
4. 結果レポート表示（追加件数、スキップ件数）

#### 5-2. 施設追加リクエスト管理画面
```
┌─────────────────────────────────────┐
│ 施設追加リクエスト一覧               │
├─────────────────────────────────────┤
│ [保留中: 5件] [承認済み: 12件]      │
│                                     │
│ 📋 保留中のリクエスト                │
│ ┌─────────────────────────────────┐ │
│ │ 施設名: ○○温泉                  │ │
│ │ 住所: 長野県飯田市××            │ │
│ │ リクエスト者: 田中さん          │ │
│ │ [承認] [却下] [詳細]            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**承認フロー**:
1. 管理者がGoogle Mapsで施設情報を確認
2. 座標・住所・カテゴリーを入力
3. 「承認」→ placesテーブルに追加（`is_verified: true`）
4. リクエストのステータスを`approved`に更新
5. （オプション）リクエスト者にメール通知

### 6. Google Maps共有URL生成

**Place IDから共有URLを生成**（完全な短縮URLは不可）:
```typescript
// 代替URL生成
const googleMapsUrl = place_id
  ? `https://www.google.com/maps/place/?q=place_id:${place_id}`
  : null
```

**または**:
- 手動でGoogle Maps共有URLを取得してCSVに含める
- 管理画面で個別に編集可能にする

## 実装タスク

### Phase 1: データベース & API
- [ ] データベース設計
  - [ ] placesテーブル拡張マイグレーション
  - [ ] facility_requestsテーブル作成
  - [ ] インデックス追加
  - [ ] database.types.ts再生成
- [ ] 施設検索API実装（`/api/facilities/search`）
  - [ ] PostgreSQL全文検索
  - [ ] ILIKE部分一致フォールバック
  - [ ] エリア・カテゴリー絞り込み
  - [ ] レスポンス整形
- [ ] 施設追加リクエストAPI実装（`/api/facility-requests`）
  - [ ] POST: リクエスト保存
  - [ ] Resendメール送信
  - [ ] バリデーション
  - [ ] エラーハンドリング

### Phase 2: UI改修
- [ ] PostModal大幅改修
  - [ ] Step 1: 施設検索UI（Google Maps URL入力廃止）
  - [ ] リアルタイムサジェスト実装
  - [ ] 施設選択 → Step 2遷移
  - [ ] 「施設追加リクエスト」ボタン
- [ ] FacilitySearchInput コンポーネント作成
  - [ ] 検索ボックス
  - [ ] サジェストリスト
  - [ ] デバウンス処理（300ms）
  - [ ] キーボードナビゲーション
- [ ] FacilityRequestModal コンポーネント作成
  - [ ] リクエストフォーム
  - [ ] バリデーション
  - [ ] 送信確認メッセージ

### Phase 3: データ取得 & インポート
- [ ] Google Places API一括取得スクリプト
  - [ ] 複数エリア × カテゴリーの組み合わせ取得
  - [ ] Place Details取得
  - [ ] CSV出力
  - [ ] 進捗表示
  - [ ] エラーハンドリング
  - [ ] npm scriptに追加（`npm run import-places`）
- [ ] 管理画面: CSVインポート機能
  - [ ] CSVアップロードフォーム
  - [ ] ファイル検証
  - [ ] 重複チェック
  - [ ] 一括INSERT
  - [ ] 結果レポート表示

### Phase 4: 管理画面拡張
- [ ] 施設追加リクエスト管理画面
  - [ ] リクエスト一覧表示
  - [ ] フィルタリング（pending/approved/rejected）
  - [ ] 詳細モーダル
  - [ ] 承認/却下機能
  - [ ] 施設情報入力フォーム
  - [ ] placesテーブルへ追加
- [ ] 施設データ管理画面
  - [ ] 施設一覧表示
  - [ ] 検索・絞り込み
  - [ ] 編集機能
  - [ ] 削除機能（論理削除）
  - [ ] Google Maps URL編集

### Phase 5: テスト & デプロイ
- [ ] E2Eテスト
  - [ ] 施設検索フロー
  - [ ] 施設追加リクエストフロー
  - [ ] CSVインポート
- [ ] パフォーマンステスト
  - [ ] 検索速度（1000件データ）
  - [ ] サジェスト応答速度
- [ ] ドキュメント更新
  - [ ] CLAUDE.md
  - [ ] README.md

## 関連ファイル

### 新規作成
- `src/app/api/facilities/search/route.ts` - 施設検索API
- `src/app/api/facility-requests/route.ts` - 施設追加リクエストAPI
- `src/components/PostModal/FacilitySearchInput.tsx` - 施設検索入力
- `src/components/PostModal/FacilityRequestModal.tsx` - 施設追加リクエストモーダル
- `src/components/Admin/FacilityRequestList.tsx` - リクエスト一覧
- `src/components/Admin/FacilityImport.tsx` - CSVインポート
- `src/components/Admin/FacilityList.tsx` - 施設一覧管理
- `src/lib/resend.ts` - Resendメール送信
- `scripts/import-places.ts` - Google Places API一括取得スクリプト
- `supabase/migrations/YYYYMMDD_add_facility_features.sql` - マイグレーション

### 修正
- `src/components/PostModal/PostModal.tsx` - Step 1を施設検索に変更
- `src/app/api/recommendations/route.ts` - 選択した施設IDを使用（URL解析廃止）
- `src/types/database.types.ts` - 型定義再生成

### 削除（非推奨化）
- `src/app/api/parse-gmaps/route.ts` - Google Maps URL解析API（将来削除）

## 完了条件
- [ ] 500件以上の施設がデータベースに登録されている
- [ ] キーワード検索で施設をリアルタイム検索できる
- [ ] 施設選択から口コミ投稿まで迷わず完了できる
- [ ] 施設が見つからない場合、追加リクエストを送信できる
- [ ] 管理者にメール通知が届く（rabo.hohoemi@gmail.com）
- [ ] 管理画面でリクエストを承認・却下できる
- [ ] 管理画面でCSVから一括インポートできる
- [ ] Google Maps URL経由での投稿フローが廃止されている
- [ ] 高齢者でも迷わず使えるUXになっている

## 備考

### 実装の優先順位
1. **最優先**: 施設検索UI + リクエスト機能（UX改善）
2. **高**: 管理画面でのCSVインポート
3. **中**: Google Places API自動取得スクリプト

### データ取得戦略
- 初期500件はGoogle Places APIで自動取得
- CSV出力して管理者がレビュー
- 不要な施設を削除、必要な施設を追加
- 管理画面から再インポート

### メンテナンス計画
- 四半期ごとにGoogle Places APIで情報更新
- ユーザーリクエストを随時追加
- 閉店・移転した施設は論理削除

### 既存データの移行
- 現在の3件の施設データはそのまま維持
- `created_by = 'legacy'` として区別

### Phase 1.5の位置づけ
- Ticket 008（検索・フィルタ）の前提条件
- 施設データベースがあれば、フィルタリングも容易
- Phase 1（MVP）の仕上げとして実施
